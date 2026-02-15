package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.auth.*;
import com.zylo.security.UserPrincipal;
import com.zylo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/otp/request")
    public ResponseEntity<ApiResponse<Void>> requestOtp(@Valid @RequestBody OtpRequestDto request) {
        authService.requestOtp(request);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<ApiResponse<AuthResponseDto>> verifyOtp(@Valid @RequestBody OtpVerifyDto request) {
        AuthResponseDto response = authService.verifyOtp(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponseDto>> refreshToken(@Valid @RequestBody RefreshTokenDto request) {
        AuthResponseDto response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshTokenDto request) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        authService.logout(UserPrincipal.getCurrentUserId(), refreshToken);
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/logout/all")
    public ResponseEntity<ApiResponse<Void>> logoutAll() {
        authService.logoutAll(UserPrincipal.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
