package com.zylo.service;

import com.zylo.config.AppConfig;
import com.zylo.domain.Booking;
import com.zylo.domain.Slot;
import com.zylo.domain.User;
import com.zylo.dto.booking.*;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.BookingRepository;
import com.zylo.repository.SlotRepository;
import com.zylo.util.IdempotencyService;
import com.zylo.util.RedisLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int LOCK_TIMEOUT_MS = 30000;
    private static final int LOCK_RETRY_COUNT = 3;

    private final BookingRepository bookingRepository;
    private final SlotRepository slotRepository;
    private final RedisLockService redisLockService;
    private final IdempotencyService idempotencyService;
    private final NotificationService notificationService;
    private final AppConfig appConfig;

    @Transactional
    public BookingResponseDto createBooking(User user, CreateBookingDto request) {
        // Check idempotency
        Optional<BookingResponseDto> existingResult = idempotencyService.getExistingResult(
            request.getIdempotencyKey(),
            BookingResponseDto.class
        );
        if (existingResult.isPresent()) {
            log.info("Returning cached booking result for idempotency key: {}", request.getIdempotencyKey());
            return existingResult.get();
        }

        // Check if already processing
        if (!idempotencyService.trySetProcessing(request.getIdempotencyKey())) {
            throw new ApiException(ErrorCode.DUPLICATE_BOOKING);
        }

        try {
            // Execute with distributed lock
            String lockKey = "slot:" + request.getSlotId();
            BookingResponseDto result = redisLockService.executeWithLock(
                lockKey,
                LOCK_TIMEOUT_MS,
                LOCK_RETRY_COUNT,
                () -> processBooking(user, request)
            );

            if (result == null) {
                throw new ApiException(ErrorCode.BOOKING_LOCK_FAILED);
            }

            // Cache result for idempotency
            idempotencyService.storeResult(request.getIdempotencyKey(), result);

            return result;
        } finally {
            idempotencyService.clearProcessing(request.getIdempotencyKey());
        }
    }

    private BookingResponseDto processBooking(User user, CreateBookingDto request) {
        // Fetch slot with lock for update
        Slot slot = slotRepository.findByIdWithCourtAndVenue(request.getSlotId())
            .orElseThrow(() -> new ApiException(ErrorCode.SLOT_NOT_FOUND));

        // Validate slot is in the future
        LocalDateTime slotDateTime = LocalDateTime.of(slot.getDate(), slot.getStartTime());
        if (slotDateTime.isBefore(LocalDateTime.now())) {
            throw new ApiException(ErrorCode.SLOT_IN_PAST);
        }

        // Check availability
        if (!slot.isAvailable()) {
            throw new ApiException(ErrorCode.SLOT_NOT_AVAILABLE);
        }

        // Double-check no active booking exists (defensive)
        if (bookingRepository.findActiveBookingForSlot(slot.getId()).isPresent()) {
            throw new ApiException(ErrorCode.SLOT_ALREADY_BOOKED);
        }

        // Mark slot as booked
        slot.setStatus(Slot.SlotStatus.BOOKED);
        slotRepository.save(slot);

        // Create booking
        // In demo mode (skipPayment=true), auto-confirm booking without payment
        boolean demoMode = appConfig.getBooking().isSkipPayment();
        Booking booking = Booking.builder()
            .user(user)
            .slot(slot)
            .idempotencyKey(request.getIdempotencyKey())
            .amount(slot.getCourt().getPricePerHour())
            .status(demoMode ? Booking.BookingStatus.CONFIRMED : Booking.BookingStatus.PENDING)
            .paymentStatus(demoMode ? Booking.PaymentStatus.SUCCESS : Booking.PaymentStatus.PENDING)
            .build();

        booking = bookingRepository.save(booking);
        log.info("Booking created: {} for slot: {} by user: {} (demo mode: {})",
            booking.getId(), slot.getId(), user.getId(), demoMode);

        if (demoMode) {
            notificationService.sendBookingConfirmedNotification(booking);
        }

        return BookingResponseDto.fromEntity(booking);
    }

    @Transactional(readOnly = true)
    public Page<BookingResponseDto> getUserBookings(UUID userId, Pageable pageable) {
        return bookingRepository.findByUserIdWithDetails(userId, pageable)
            .map(BookingResponseDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public BookingResponseDto getBooking(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findByIdWithAllDetails(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        // Verify ownership or admin
        if (!booking.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        return BookingResponseDto.fromEntity(booking);
    }

    @Transactional
    public BookingResponseDto cancelBooking(UUID bookingId, User user, String reason) {
        Booking booking = bookingRepository.findByIdWithAllDetails(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        // Verify ownership
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        return performCancellation(booking, user, reason);
    }

    @Transactional
    public BookingResponseDto adminCancelBooking(UUID bookingId, User admin, String reason) {
        Booking booking = bookingRepository.findByIdWithAllDetails(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        return performCancellation(booking, admin, reason);
    }

    private BookingResponseDto performCancellation(Booking booking, User cancelledBy, String reason) {
        if (!booking.canCancel()) {
            throw new ApiException(ErrorCode.BOOKING_CANNOT_CANCEL);
        }

        // Free the slot
        Slot slot = booking.getSlot();
        slot.setStatus(Slot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        // Update booking
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setCancelledBy(cancelledBy);
        booking.setCancellationReason(reason);

        booking = bookingRepository.save(booking);
        log.info("Booking cancelled: {} by user: {}", booking.getId(), cancelledBy.getId());

        // Send notification
        notificationService.sendBookingCancelledNotification(booking);

        return BookingResponseDto.fromEntity(booking);
    }

    @Transactional
    public void confirmBooking(UUID bookingId, String paymentId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setPaymentStatus(Booking.PaymentStatus.SUCCESS);
        booking.setPaymentId(paymentId);

        bookingRepository.save(booking);
        log.info("Booking confirmed: {} with payment: {}", bookingId, paymentId);

        // Send notification
        notificationService.sendBookingConfirmedNotification(booking);
    }

    @Transactional
    public void markPaymentFailed(UUID bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        // Free the slot
        Slot slot = booking.getSlot();
        slot.setStatus(Slot.SlotStatus.AVAILABLE);
        slotRepository.save(slot);

        // Update booking
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setPaymentStatus(Booking.PaymentStatus.FAILED);
        booking.setCancellationReason("Payment failed: " + reason);

        bookingRepository.save(booking);
        log.info("Booking cancelled due to payment failure: {}", bookingId);
    }

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void expirePendingBookings() {
        LocalDateTime expiryTime = LocalDateTime.now()
            .minusMinutes(appConfig.getBooking().getPendingExpiryMinutes());

        var expiredBookings = bookingRepository.findExpiredPendingBookings(expiryTime);

        for (Booking booking : expiredBookings) {
            log.info("Expiring pending booking: {}", booking.getId());

            // Free the slot
            Slot slot = booking.getSlot();
            slot.setStatus(Slot.SlotStatus.AVAILABLE);
            slotRepository.save(slot);

            // Cancel booking
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            booking.setCancellationReason("Payment timeout");
            bookingRepository.save(booking);
        }

        if (!expiredBookings.isEmpty()) {
            log.info("Expired {} pending bookings", expiredBookings.size());
        }
    }
}
