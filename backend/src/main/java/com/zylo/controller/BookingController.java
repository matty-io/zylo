package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.booking.*;
import com.zylo.security.UserPrincipal;
import com.zylo.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDto>> createBooking(
            @Valid @RequestBody CreateBookingDto request) {
        BookingResponseDto response = bookingService.createBooking(
            UserPrincipal.getCurrentUser(),
            request
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<BookingResponseDto>>> getMyBookings(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<BookingResponseDto> bookings = bookingService.getUserBookings(
            UserPrincipal.getCurrentUserId(),
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<ApiResponse<BookingResponseDto>> getBooking(
            @PathVariable UUID bookingId) {
        BookingResponseDto booking = bookingService.getBooking(
            bookingId,
            UserPrincipal.getCurrentUserId()
        );
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(
            @PathVariable UUID bookingId,
            @RequestBody(required = false) CancelBookingDto request) {
        String reason = request != null ? request.getReason() : null;
        BookingResponseDto booking = bookingService.cancelBooking(
            bookingId,
            UserPrincipal.getCurrentUser(),
            reason
        );
        return ResponseEntity.ok(ApiResponse.success(booking));
    }
}
