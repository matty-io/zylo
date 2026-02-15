package com.zylo.controller;

import com.zylo.domain.Notification;
import com.zylo.dto.ApiResponse;
import com.zylo.security.UserPrincipal;
import com.zylo.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Notification> notifications = notificationService.getUserNotifications(
            UserPrincipal.getCurrentUserId(),
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationService.getUnreadCount(UserPrincipal.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable UUID notificationId) {
        notificationService.markAsRead(notificationId, UserPrincipal.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead(UserPrincipal.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success());
    }
}
