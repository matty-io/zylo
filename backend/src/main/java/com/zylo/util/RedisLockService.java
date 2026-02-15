package com.zylo.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisLockService {

    private static final String LOCK_PREFIX = "lock:";
    private static final int DEFAULT_LOCK_TIMEOUT_MS = 30000;
    private static final int DEFAULT_RETRY_COUNT = 3;
    private static final int DEFAULT_RETRY_DELAY_MS = 100;

    private final StringRedisTemplate redisTemplate;
    private final DefaultRedisScript<Long> lockScript;
    private final DefaultRedisScript<Long> unlockScript;

    public <T> T executeWithLock(String lockKey, Supplier<T> task) {
        return executeWithLock(lockKey, DEFAULT_LOCK_TIMEOUT_MS, DEFAULT_RETRY_COUNT, task);
    }

    public <T> T executeWithLock(String lockKey, int lockTimeoutMs, int retryCount, Supplier<T> task) {
        String fullKey = LOCK_PREFIX + lockKey;
        String lockValue = UUID.randomUUID().toString();

        boolean acquired = acquireLock(fullKey, lockValue, lockTimeoutMs, retryCount);

        if (!acquired) {
            log.warn("Failed to acquire lock for key: {}", lockKey);
            return null;
        }

        try {
            log.debug("Lock acquired for key: {}", lockKey);
            return task.get();
        } finally {
            releaseLock(fullKey, lockValue);
            log.debug("Lock released for key: {}", lockKey);
        }
    }

    public boolean tryLock(String lockKey, String lockValue, int timeoutMs) {
        String fullKey = LOCK_PREFIX + lockKey;
        return acquireLock(fullKey, lockValue, timeoutMs, 1);
    }

    public void unlock(String lockKey, String lockValue) {
        String fullKey = LOCK_PREFIX + lockKey;
        releaseLock(fullKey, lockValue);
    }

    private boolean acquireLock(String key, String value, int timeoutMs, int retryCount) {
        for (int i = 0; i < retryCount; i++) {
            Long result = redisTemplate.execute(
                lockScript,
                Collections.singletonList(key),
                value,
                String.valueOf(timeoutMs)
            );

            if (result != null && result == 1L) {
                return true;
            }

            if (i < retryCount - 1) {
                try {
                    TimeUnit.MILLISECONDS.sleep(DEFAULT_RETRY_DELAY_MS);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    return false;
                }
            }
        }
        return false;
    }

    private void releaseLock(String key, String value) {
        try {
            Long result = redisTemplate.execute(
                unlockScript,
                Collections.singletonList(key),
                value
            );

            if (result != null && result == 0L) {
                log.warn("Lock was not released (already expired or owned by another process): {}", key);
            }
        } catch (Exception e) {
            log.error("Error releasing lock: {}", key, e);
        }
    }
}
