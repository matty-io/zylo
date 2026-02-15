package com.zylo.service;

import com.zylo.config.JwtConfig;
import com.zylo.domain.RefreshToken;
import com.zylo.domain.User;
import com.zylo.dto.auth.*;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.RefreshTokenRepository;
import com.zylo.repository.UserRepository;
import com.zylo.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.codec.Hex;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OtpService otpService;
    private final JwtProvider jwtProvider;
    private final JwtConfig jwtConfig;

    public void requestOtp(OtpRequestDto request) {
        otpService.sendOtp(request.getPhone());
    }

    @Transactional
    public AuthResponseDto verifyOtp(OtpVerifyDto request) {
        boolean valid = otpService.verifyOtp(request.getPhone(), request.getOtp());

        if (!valid) {
            throw new ApiException(ErrorCode.INVALID_OTP);
        }

        // Find or create user
        User user = userRepository.findByPhone(request.getPhone())
            .orElseGet(() -> createUser(request.getPhone()));

        if (user.isBlocked()) {
            throw new ApiException(ErrorCode.USER_BLOCKED);
        }

        return generateAuthResponse(user, request.getDeviceInfo());
    }

    @Transactional
    public AuthResponseDto refreshToken(RefreshTokenDto request) {
        String tokenHash = hashToken(request.getRefreshToken());

        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new ApiException(ErrorCode.INVALID_REFRESH_TOKEN));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new ApiException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }

        User user = refreshToken.getUser();
        if (user.isBlocked()) {
            throw new ApiException(ErrorCode.USER_BLOCKED);
        }

        // Delete old refresh token
        refreshTokenRepository.delete(refreshToken);

        return generateAuthResponse(user, request.getDeviceInfo());
    }

    @Transactional
    public void logout(UUID userId, String refreshToken) {
        if (refreshToken != null) {
            String tokenHash = hashToken(refreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(refreshTokenRepository::delete);
        }
    }

    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private User createUser(String phone) {
        User user = User.builder()
            .phone(phone)
            .role(User.Role.USER)
            .build();
        return userRepository.save(user);
    }

    private AuthResponseDto generateAuthResponse(User user, String deviceInfo) {
        String accessToken = jwtProvider.generateAccessToken(user);
        String refreshToken = jwtProvider.generateRefreshToken();

        // Save refresh token
        RefreshToken token = RefreshToken.builder()
            .user(user)
            .tokenHash(hashToken(refreshToken))
            .deviceInfo(deviceInfo)
            .expiresAt(LocalDateTime.now().plus(jwtConfig.getRefreshTokenExpiry()))
            .build();
        refreshTokenRepository.save(token);

        return AuthResponseDto.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(jwtConfig.getAccessTokenExpiry().toSeconds())
            .user(UserDto.fromEntity(user))
            .build();
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return new String(Hex.encode(hash));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}
