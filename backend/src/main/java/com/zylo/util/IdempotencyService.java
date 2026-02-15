package com.zylo.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private static final String IDEMPOTENCY_PREFIX = "idempotency:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(24);

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public <T> Optional<T> getExistingResult(String idempotencyKey, Class<T> resultType) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return Optional.empty();
        }

        String key = IDEMPOTENCY_PREFIX + idempotencyKey;
        String cachedValue = redisTemplate.opsForValue().get(key);

        if (cachedValue == null) {
            return Optional.empty();
        }

        try {
            T result = objectMapper.readValue(cachedValue, resultType);
            log.debug("Found cached result for idempotency key: {}", idempotencyKey);
            return Optional.of(result);
        } catch (JsonProcessingException e) {
            log.error("Error deserializing cached result for key: {}", idempotencyKey, e);
            return Optional.empty();
        }
    }

    public <T> void storeResult(String idempotencyKey, T result) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }

        String key = IDEMPOTENCY_PREFIX + idempotencyKey;

        try {
            String serialized = objectMapper.writeValueAsString(result);
            redisTemplate.opsForValue().set(key, serialized, DEFAULT_TTL);
            log.debug("Stored result for idempotency key: {}", idempotencyKey);
        } catch (JsonProcessingException e) {
            log.error("Error serializing result for key: {}", idempotencyKey, e);
        }
    }

    public boolean trySetProcessing(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return true;
        }

        String key = IDEMPOTENCY_PREFIX + idempotencyKey + ":processing";
        Boolean set = redisTemplate.opsForValue().setIfAbsent(key, "1", Duration.ofMinutes(5));
        return Boolean.TRUE.equals(set);
    }

    public void clearProcessing(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }

        String key = IDEMPOTENCY_PREFIX + idempotencyKey + ":processing";
        redisTemplate.delete(key);
    }
}
