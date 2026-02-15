package com.zylo.repository;

import com.zylo.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhone(String phone);

    boolean existsByPhone(String phone);

    @Modifying
    @Query("UPDATE User u SET u.fcmToken = :fcmToken WHERE u.id = :userId")
    void updateFcmToken(UUID userId, String fcmToken);

    @Modifying
    @Query("UPDATE User u SET u.blocked = :blocked WHERE u.id = :userId")
    void updateBlockedStatus(UUID userId, boolean blocked);
}
