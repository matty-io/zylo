package com.zylo.dto.game;

import com.zylo.domain.Game;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameListDto {

    private UUID id;
    private String title;
    private String sport;
    private int maxPlayers;
    private int currentPlayers;
    private String skillLevel;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String venueName;
    private String venueCity;
    private String creatorName;

    public static GameListDto fromEntity(Game game) {
        var slot = game.getBooking().getSlot();
        var venue = slot.getCourt().getVenue();

        return GameListDto.builder()
            .id(game.getId())
            .title(game.getTitle())
            .sport(game.getSport())
            .maxPlayers(game.getMaxPlayers())
            .currentPlayers(game.getCurrentPlayerCount())
            .skillLevel(game.getSkillLevel())
            .date(slot.getDate())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .venueName(venue.getName())
            .venueCity(venue.getCity())
            .creatorName(game.getCreator().getName())
            .build();
    }
}
