package com.zylo.repository;

import com.zylo.domain.GameParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameParticipantRepository extends JpaRepository<GameParticipant, UUID> {

    Optional<GameParticipant> findByGameIdAndUserId(UUID gameId, UUID userId);

    @Query("""
        SELECT gp FROM GameParticipant gp
        JOIN FETCH gp.user
        WHERE gp.game.id = :gameId
        AND gp.status = 'JOINED'
        ORDER BY gp.joinedAt
        """)
    List<GameParticipant> findActiveParticipants(UUID gameId);

    @Query("SELECT COUNT(gp) FROM GameParticipant gp WHERE gp.game.id = :gameId AND gp.status = 'JOINED'")
    int countActiveParticipants(UUID gameId);

    boolean existsByGameIdAndUserIdAndStatus(UUID gameId, UUID userId, GameParticipant.ParticipantStatus status);
}
