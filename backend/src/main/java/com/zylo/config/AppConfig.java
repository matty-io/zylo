package com.zylo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppConfig {

    private OtpConfig otp = new OtpConfig();
    private BookingConfig booking = new BookingConfig();
    private SlotsConfig slots = new SlotsConfig();

    @Data
    public static class OtpConfig {
        private int length = 6;
        private int expiryMinutes = 5;
    }

    @Data
    public static class BookingConfig {
        private int lockTimeoutSeconds = 30;
        private int pendingExpiryMinutes = 10;
        private boolean skipPayment = false; // Demo mode: auto-confirm bookings without payment
    }

    @Data
    public static class SlotsConfig {
        private int durationMinutes = 60;
        private int startHour = 6;
        private int endHour = 23;
    }
}
