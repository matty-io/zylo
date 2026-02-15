package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.payment.*;
import com.zylo.security.UserPrincipal;
import com.zylo.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentInitiateResponseDto>> initiatePayment(
            @RequestParam UUID bookingId) {
        PaymentInitiateResponseDto response = paymentService.initiatePayment(
            bookingId,
            UserPrincipal.getCurrentUserId()
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentVerifyResponseDto>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequestDto request) {
        PaymentVerifyResponseDto response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
