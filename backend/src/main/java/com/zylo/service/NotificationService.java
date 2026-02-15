package com.zylo.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.zylo.domain.Booking;
import com.zylo.domain.Game;
import com.zylo.domain.Notification;
import com.zylo.domain.User;
import com.zylo.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Async
    public void sendBookingConfirmedNotification(Booking booking) {
        String title = "Booking Confirmed!";
        String body = String.format("Your booking at %s for %s on %s at %s is confirmed.",
            booking.getSlot().getCourt().getVenue().getName(),
            booking.getSlot().getCourt().getSport(),
            booking.getSlot().getDate(),
            booking.getSlot().getStartTime()
        );

        Map<String, Object> data = new HashMap<>();
        data.put("bookingId", booking.getId().toString());
        data.put("type", "BOOKING_CONFIRMED");

        createAndSendNotification(
            booking.getUser(),
            Notification.NotificationType.BOOKING_CONFIRMED,
            title,
            body,
            data
        );
    }

    @Async
    public void sendBookingCancelledNotification(Booking booking) {
        String title = "Booking Cancelled";
        String body = String.format("Your booking at %s has been cancelled.",
            booking.getSlot().getCourt().getVenue().getName()
        );

        Map<String, Object> data = new HashMap<>();
        data.put("bookingId", booking.getId().toString());
        data.put("type", "BOOKING_CANCELLED");

        createAndSendNotification(
            booking.getUser(),
            Notification.NotificationType.BOOKING_CANCELLED,
            title,
            body,
            data
        );
    }

    @Async
    public void sendGameJoinedNotification(Game game, User joinedUser) {
        String title = "New Player Joined!";
        String body = String.format("%s joined your game '%s'",
            joinedUser.getName() != null ? joinedUser.getName() : "A player",
            game.getTitle()
        );

        Map<String, Object> data = new HashMap<>();
        data.put("gameId", game.getId().toString());
        data.put("type", "GAME_JOINED");

        createAndSendNotification(
            game.getCreator(),
            Notification.NotificationType.GAME_JOINED,
            title,
            body,
            data
        );
    }

    @Async
    public void sendPaymentSuccessNotification(Booking booking) {
        String title = "Payment Successful";
        String body = String.format("Payment of ₹%.2f received for your booking.",
            booking.getAmount()
        );

        Map<String, Object> data = new HashMap<>();
        data.put("bookingId", booking.getId().toString());
        data.put("type", "PAYMENT_SUCCESS");

        createAndSendNotification(
            booking.getUser(),
            Notification.NotificationType.PAYMENT_SUCCESS,
            title,
            body,
            data
        );
    }

    @Transactional
    public void createAndSendNotification(User user, Notification.NotificationType type,
                                          String title, String body, Map<String, Object> data) {
        // Save to database
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .title(title)
            .body(body)
            .data(data)
            .build();
        notificationRepository.save(notification);

        // Send push notification if FCM token available
        if (user.getFcmToken() != null && !user.getFcmToken().isBlank()) {
            sendPushNotification(user.getFcmToken(), title, body, data);
        }
    }

    private void sendPushNotification(String fcmToken, String title, String body, Map<String, Object> data) {
        try {
            Message.Builder messageBuilder = Message.builder()
                .setToken(fcmToken)
                .setNotification(com.google.firebase.messaging.Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build());

            if (data != null) {
                data.forEach((key, value) ->
                    messageBuilder.putData(key, String.valueOf(value)));
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            log.debug("FCM notification sent: {}", response);
        } catch (Exception e) {
            log.error("Failed to send FCM notification", e);
        }
    }

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(UUID userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        notificationRepository.markAllAsRead(userId);
    }
}
