package com.zylo.service;

import com.zylo.domain.User;
import com.zylo.dto.auth.UserDto;
import com.zylo.dto.user.UpdateProfileDto;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        return UserDto.fromEntity(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileDto request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getPreferredSports() != null) {
            user.setPreferredSports(request.getPreferredSports());
        }

        user = userRepository.save(user);
        log.info("User profile updated: {}", userId);

        return UserDto.fromEntity(user);
    }

    @Transactional
    public void updateFcmToken(UUID userId, String fcmToken) {
        userRepository.updateFcmToken(userId, fcmToken);
        log.debug("FCM token updated for user: {}", userId);
    }

    @Transactional
    public void blockUser(UUID userId, boolean blocked) {
        userRepository.updateBlockedStatus(userId, blocked);
        log.info("User {} blocked status set to: {}", userId, blocked);
    }
}
