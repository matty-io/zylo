package com.zylo.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 50)
    private String sport;

    @Column(name = "max_players", nullable = false)
    private int maxPlayers;

    @Column(name = "skill_level", length = 20)
    private String skillLevel;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_public")
    @Builder.Default
    private boolean isPublic = true;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private GameStatus status = GameStatus.ACTIVE;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<GameParticipant> participants = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum GameStatus {
        ACTIVE, COMPLETED, CANCELLED
    }

    public int getCurrentPlayerCount() {
        return (int) participants.stream()
            .filter(p -> p.getStatus() == GameParticipant.ParticipantStatus.JOINED)
            .count();
    }

    public boolean isFull() {
        return getCurrentPlayerCount() >= maxPlayers;
    }

    public boolean hasPlayer(UUID userId) {
        return participants.stream()
            .anyMatch(p -> p.getUser().getId().equals(userId) &&
                          p.getStatus() == GameParticipant.ParticipantStatus.JOINED);
    }
}
