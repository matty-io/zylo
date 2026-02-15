package com.zylo.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Data
@Configuration
@ConfigurationProperties(prefix = "jwt")
public class JwtConfig {

    private String secret;
    private Duration accessTokenExpiry = Duration.ofMinutes(15);
    private Duration refreshTokenExpiry = Duration.ofDays(30);
}
