package com.zylo.config;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Data
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayConfig {

    private String keyId;
    private String keySecret;
    private String webhookSecret;

    @Bean
    public RazorpayClient razorpayClient() {
        if (keyId == null || keySecret == null || keyId.isEmpty() || keySecret.isEmpty()) {
            log.warn("Razorpay credentials not configured. Payment features will not work.");
            return null;
        }

        try {
            return new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize Razorpay client", e);
            return null;
        }
    }
}
