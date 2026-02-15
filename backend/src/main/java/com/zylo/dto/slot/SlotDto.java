package com.zylo.dto.slot;

import com.zylo.domain.Slot;
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
public class SlotDto {

    private UUID id;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private boolean available;

    public static SlotDto fromEntity(Slot slot) {
        return SlotDto.builder()
            .id(slot.getId())
            .date(slot.getDate())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .status(slot.getStatus().name())
            .available(slot.isAvailable())
            .build();
    }
}
