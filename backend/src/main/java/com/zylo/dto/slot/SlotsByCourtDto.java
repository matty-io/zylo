package com.zylo.dto.slot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SlotsByCourtDto {

    private UUID courtId;
    private String courtName;
    private String sport;
    private BigDecimal pricePerHour;
    private List<SlotDto> slots;
}
