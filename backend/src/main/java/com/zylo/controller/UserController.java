package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.auth.UserDto;
import com.zylo.dto.user.UpdateFcmTokenDto;
import com.zylo.dto.user.UpdateProfileDto;
import com.zylo.security.UserPrincipal;
import com.zylo.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile() {
        UserDto user = userService.getUserProfile(UserPrincipal.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @Valid @RequestBody UpdateProfileDto request) {
        UserDto user = userService.updateProfile(
            UserPrincipal.getCurrentUserId(),
            request
        );
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/me/fcm-token")
    public ResponseEntity<ApiResponse<Void>> updateFcmToken(
            @Valid @RequestBody UpdateFcmTokenDto request) {
        userService.updateFcmToken(UserPrincipal.getCurrentUserId(), request.getFcmToken());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
