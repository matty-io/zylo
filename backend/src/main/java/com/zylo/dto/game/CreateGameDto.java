package com.zylo.dto.game;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateGameDto {

    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    @NotBlank(message = "Title is required")
    private String title;

    @Min(value = 2, message = "Minimum 2 players required")
    @Max(value = 50, message = "Maximum 50 players allowed")
    private int maxPlayers;

    private String skillLevel;
    private String description;
    private Boolean isPublic;
}
