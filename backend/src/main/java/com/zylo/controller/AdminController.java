package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.booking.BookingResponseDto;
import com.zylo.security.UserPrincipal;
import com.zylo.service.BookingService;
import com.zylo.service.PaymentService;
import com.zylo.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final BookingService bookingService;
    private final UserService userService;
    private final PaymentService paymentService;

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDto>> cancelBooking(
            @PathVariable UUID bookingId,
            @RequestBody(required = false) CancelRequestDto request) {

        String reason = request != null ? request.getReason() : "Cancelled by admin";
        BookingResponseDto booking = bookingService.adminCancelBooking(
            bookingId,
            UserPrincipal.getCurrentUser(),
            reason
        );
        return ResponseEntity.ok(ApiResponse.success(booking));
    }

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<Void>> blockUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "true") boolean blocked) {
        userService.blockUser(userId, blocked);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/refunds")
    public ResponseEntity<ApiResponse<Void>> processRefund(
            @RequestBody RefundRequestDto request) {
        paymentService.processRefund(request.getBookingId(), request.getReason());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @Data
    public static class CancelRequestDto {
        private String reason;
    }

    @Data
    public static class RefundRequestDto {
        private UUID bookingId;
        private String reason;
    }
}
