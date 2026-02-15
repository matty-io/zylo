package com.zylo.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.zylo.config.RazorpayConfig;
import com.zylo.domain.Booking;
import com.zylo.domain.Payment;
import com.zylo.dto.payment.*;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.BookingRepository;
import com.zylo.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Formatter;
import java.util.UUID;

@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final NotificationService notificationService;
    private final RazorpayConfig razorpayConfig;

    private RazorpayClient razorpayClient;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          BookingService bookingService,
                          NotificationService notificationService,
                          RazorpayConfig razorpayConfig) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.notificationService = notificationService;
        this.razorpayConfig = razorpayConfig;
    }

    @Autowired(required = false)
    public void setRazorpayClient(RazorpayClient razorpayClient) {
        this.razorpayClient = razorpayClient;
    }

    @Transactional
    public PaymentInitiateResponseDto initiatePayment(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findByIdWithAllDetails(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        // Verify ownership
        if (!booking.getUser().getId().equals(userId)) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        // Check if payment already exists
        var existingPayment = paymentRepository.findByBookingId(bookingId);
        if (existingPayment.isPresent() &&
            existingPayment.get().getStatus() == Payment.PaymentStatus.CAPTURED) {
            throw new ApiException(ErrorCode.PAYMENT_FAILED, "Payment already completed");
        }

        if (razorpayClient == null) {
            return createMockPayment(booking);
        }

        return createRazorpayOrder(booking);
    }

    private PaymentInitiateResponseDto createRazorpayOrder(Booking booking) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", booking.getAmount().multiply(java.math.BigDecimal.valueOf(100)).intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", booking.getId().toString());

            Order order = razorpayClient.orders.create(orderRequest);

            Payment payment = Payment.builder()
                .booking(booking)
                .razorpayOrderId(order.get("id"))
                .amount(booking.getAmount())
                .status(Payment.PaymentStatus.CREATED)
                .build();
            paymentRepository.save(payment);

            // Update booking with order ID
            booking.setPaymentOrderId(order.get("id"));
            bookingRepository.save(booking);

            return PaymentInitiateResponseDto.builder()
                .orderId(order.get("id"))
                .amount(booking.getAmount())
                .currency("INR")
                .keyId(razorpayConfig.getKeyId())
                .bookingId(booking.getId())
                .build();

        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order", e);
            throw new ApiException(ErrorCode.PAYMENT_FAILED);
        }
    }

    private PaymentInitiateResponseDto createMockPayment(Booking booking) {
        String mockOrderId = "order_mock_" + System.currentTimeMillis();

        Payment payment = Payment.builder()
            .booking(booking)
            .razorpayOrderId(mockOrderId)
            .amount(booking.getAmount())
            .status(Payment.PaymentStatus.CREATED)
            .build();
        paymentRepository.save(payment);

        booking.setPaymentOrderId(mockOrderId);
        bookingRepository.save(booking);

        log.info("Mock payment order created: {}", mockOrderId);

        return PaymentInitiateResponseDto.builder()
            .orderId(mockOrderId)
            .amount(booking.getAmount())
            .currency("INR")
            .keyId("mock_key")
            .bookingId(booking.getId())
            .mock(true)
            .build();
    }

    @Transactional
    public PaymentVerifyResponseDto verifyPayment(PaymentVerifyRequestDto request) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getOrderId())
            .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        // For mock payments
        if (request.getOrderId().startsWith("order_mock_")) {
            return completeMockPayment(payment, request);
        }

        // Verify signature
        boolean verified = verifyRazorpaySignature(
            request.getOrderId(),
            request.getPaymentId(),
            request.getSignature()
        );

        if (!verified) {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason("Invalid signature");
            paymentRepository.save(payment);

            bookingService.markPaymentFailed(payment.getBooking().getId(), "Invalid signature");

            throw new ApiException(ErrorCode.INVALID_PAYMENT_SIGNATURE);
        }

        // Update payment
        payment.setRazorpayPaymentId(request.getPaymentId());
        payment.setRazorpaySignature(request.getSignature());
        payment.setStatus(Payment.PaymentStatus.CAPTURED);
        paymentRepository.save(payment);

        // Confirm booking
        bookingService.confirmBooking(payment.getBooking().getId(), request.getPaymentId());

        return PaymentVerifyResponseDto.builder()
            .success(true)
            .bookingId(payment.getBooking().getId())
            .message("Payment successful")
            .build();
    }

    private PaymentVerifyResponseDto completeMockPayment(Payment payment, PaymentVerifyRequestDto request) {
        payment.setRazorpayPaymentId("pay_mock_" + System.currentTimeMillis());
        payment.setStatus(Payment.PaymentStatus.CAPTURED);
        paymentRepository.save(payment);

        bookingService.confirmBooking(payment.getBooking().getId(), payment.getRazorpayPaymentId());

        log.info("Mock payment completed for booking: {}", payment.getBooking().getId());

        return PaymentVerifyResponseDto.builder()
            .success(true)
            .bookingId(payment.getBooking().getId())
            .message("Payment successful (mock)")
            .build();
    }

    private boolean verifyRazorpaySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                razorpayConfig.getWebhookSecret().getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));

            String expectedSignature = toHexString(hash);
            return expectedSignature.equals(signature);

        } catch (Exception e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }

    private String toHexString(byte[] bytes) {
        Formatter formatter = new Formatter();
        for (byte b : bytes) {
            formatter.format("%02x", b);
        }
        return formatter.toString();
    }

    @Transactional
    public void processRefund(UUID bookingId, String reason) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != Payment.PaymentStatus.CAPTURED) {
            throw new ApiException(ErrorCode.REFUND_FAILED, "Payment not captured");
        }

        if (razorpayClient == null) {
            processMockRefund(payment, reason);
            return;
        }

        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", payment.getAmount().multiply(java.math.BigDecimal.valueOf(100)).intValue());

            var refund = razorpayClient.payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            payment.setRefundId(refund.get("id"));
            payment.setRefundStatus(Payment.RefundStatus.PROCESSED);
            payment.setRefundedAt(java.time.LocalDateTime.now());
            paymentRepository.save(payment);

            log.info("Refund processed for booking: {}", bookingId);

        } catch (RazorpayException e) {
            log.error("Failed to process refund", e);
            payment.setRefundStatus(Payment.RefundStatus.FAILED);
            paymentRepository.save(payment);
            throw new ApiException(ErrorCode.REFUND_FAILED);
        }
    }

    private void processMockRefund(Payment payment, String reason) {
        payment.setRefundId("refund_mock_" + System.currentTimeMillis());
        payment.setRefundStatus(Payment.RefundStatus.PROCESSED);
        payment.setRefundedAt(java.time.LocalDateTime.now());
        paymentRepository.save(payment);

        log.info("Mock refund processed for booking: {}", payment.getBooking().getId());
    }
}
