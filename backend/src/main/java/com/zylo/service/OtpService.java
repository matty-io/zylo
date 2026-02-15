package com.zylo.service;

import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import com.zylo.config.AppConfig;
import com.zylo.config.TwilioConfig;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final String OTP_KEY_PREFIX = "otp:";
    private static final String OTP_ATTEMPTS_PREFIX = "otp_attempts:";
    private static final int MAX_ATTEMPTS = 5;

    private final TwilioConfig twilioConfig;
    private final AppConfig appConfig;
    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    public void sendOtp(String phone) {
        // Check rate limiting
        String attemptsKey = OTP_ATTEMPTS_PREFIX + phone;
        String attemptsStr = redisTemplate.opsForValue().get(attemptsKey);
        int attempts = attemptsStr != null ? Integer.parseInt(attemptsStr) : 0;

        if (attempts >= MAX_ATTEMPTS) {
            throw new ApiException(ErrorCode.TOO_MANY_OTP_REQUESTS);
        }

        if (twilioConfig.isEnabled()) {
            sendTwilioOtp(phone);
        } else {
            sendMockOtp(phone);
        }

        // Increment attempts
        redisTemplate.opsForValue().increment(attemptsKey);
        redisTemplate.expire(attemptsKey, Duration.ofMinutes(15));
    }

    public boolean verifyOtp(String phone, String otp) {
        if (twilioConfig.isEnabled()) {
            return verifyTwilioOtp(phone, otp);
        } else {
            return verifyMockOtp(phone, otp);
        }
    }

    private void sendTwilioOtp(String phone) {
        try {
            Verification verification = Verification.creator(
                twilioConfig.getVerifyServiceSid(),
                phone,
                "sms"
            ).create();

            log.info("Twilio verification sent to {}, SID: {}", phone, verification.getSid());
        } catch (Exception e) {
            log.error("Failed to send Twilio OTP to {}", phone, e);
            throw new ApiException(ErrorCode.OTP_SEND_FAILED);
        }
    }

    private boolean verifyTwilioOtp(String phone, String otp) {
        try {
            VerificationCheck check = VerificationCheck.creator(
                twilioConfig.getVerifyServiceSid()
            )
                .setTo(phone)
                .setCode(otp)
                .create();

            boolean valid = "approved".equals(check.getStatus());
            if (valid) {
                // Clear rate limit on success
                redisTemplate.delete(OTP_ATTEMPTS_PREFIX + phone);
            }
            return valid;
        } catch (Exception e) {
            log.error("Failed to verify Twilio OTP for {}", phone, e);
            return false;
        }
    }

    private void sendMockOtp(String phone) {
        String otp = generateOtp();
        String key = OTP_KEY_PREFIX + phone;

        redisTemplate.opsForValue().set(
            key,
            otp,
            Duration.ofMinutes(appConfig.getOtp().getExpiryMinutes())
        );

        log.info("========================================");
        log.info("MOCK OTP for {}: {}", phone, otp);
        log.info("========================================");
    }

    private boolean verifyMockOtp(String phone, String otp) {
        String key = OTP_KEY_PREFIX + phone;
        String storedOtp = redisTemplate.opsForValue().get(key);

        if (storedOtp == null) {
            throw new ApiException(ErrorCode.OTP_EXPIRED);
        }

        boolean valid = storedOtp.equals(otp);
        if (valid) {
            redisTemplate.delete(key);
            redisTemplate.delete(OTP_ATTEMPTS_PREFIX + phone);
        }

        return valid;
    }

    private String generateOtp() {
        int otpLength = appConfig.getOtp().getLength();
        int bound = (int) Math.pow(10, otpLength);
        int otp = secureRandom.nextInt(bound);
        return String.format("%0" + otpLength + "d", otp);
    }
}
