package com.zylo.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateFcmTokenDto {

    @NotBlank(message = "FCM token is required")
    private String fcmToken;
}
