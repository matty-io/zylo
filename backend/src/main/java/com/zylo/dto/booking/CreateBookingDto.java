package com.zylo.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateBookingDto {

    @NotNull(message = "Slot ID is required")
    private UUID slotId;

    private String idempotencyKey;
}
