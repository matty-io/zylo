package com.zylo.dto.game;

import com.zylo.domain.Game;
import com.zylo.domain.GameParticipant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResponseDto {

    private UUID id;
    private String title;
    private String sport;
    private int maxPlayers;
    private int currentPlayers;
    private String skillLevel;
    private String description;
    private boolean isPublic;
    private String status;
    private LocalDateTime createdAt;

    // Slot details
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    // Venue details
    private UUID venueId;
    private String venueName;
    private String venueAddress;

    // Creator
    private UUID creatorId;
    private String creatorName;

    // Participants
    private List<ParticipantDto> participants;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDto {
        private UUID userId;
        private String name;
        private LocalDateTime joinedAt;

        public static ParticipantDto fromEntity(GameParticipant participant) {
            return ParticipantDto.builder()
                .userId(participant.getUser().getId())
                .name(participant.getUser().getName())
                .joinedAt(participant.getJoinedAt())
                .build();
        }
    }

    public static GameResponseDto fromEntity(Game game) {
        var slot = game.getBooking().getSlot();
        var venue = slot.getCourt().getVenue();

        return GameResponseDto.builder()
            .id(game.getId())
            .title(game.getTitle())
            .sport(game.getSport())
            .maxPlayers(game.getMaxPlayers())
            .currentPlayers(game.getCurrentPlayerCount())
            .skillLevel(game.getSkillLevel())
            .description(game.getDescription())
            .isPublic(game.isPublic())
            .status(game.getStatus().name())
            .createdAt(game.getCreatedAt())
            .date(slot.getDate())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .venueId(venue.getId())
            .venueName(venue.getName())
            .venueAddress(venue.getAddress())
            .creatorId(game.getCreator().getId())
            .creatorName(game.getCreator().getName())
            .build();
    }

    public static GameResponseDto fromEntityWithParticipants(Game game, List<GameParticipant> participants) {
        GameResponseDto dto = fromEntity(game);
        dto.setParticipants(
            participants.stream()
                .map(ParticipantDto::fromEntity)
                .toList()
        );
        dto.setCurrentPlayers(participants.size());
        return dto;
    }
}
