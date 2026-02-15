package com.zylo.dto.booking;

import com.zylo.domain.Booking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {

    private UUID id;
    private UUID slotId;
    private String status;
    private BigDecimal amount;
    private String paymentStatus;
    private String paymentOrderId;
    private LocalDateTime createdAt;

    // Slot details
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    // Court details
    private UUID courtId;
    private String courtName;
    private String sport;

    // Venue details
    private UUID venueId;
    private String venueName;
    private String venueAddress;

    public static BookingResponseDto fromEntity(Booking booking) {
        var slot = booking.getSlot();
        var court = slot.getCourt();
        var venue = court.getVenue();

        return BookingResponseDto.builder()
            .id(booking.getId())
            .slotId(slot.getId())
            .status(booking.getStatus().name())
            .amount(booking.getAmount())
            .paymentStatus(booking.getPaymentStatus().name())
            .paymentOrderId(booking.getPaymentOrderId())
            .createdAt(booking.getCreatedAt())
            .date(slot.getDate())
            .startTime(slot.getStartTime())
            .endTime(slot.getEndTime())
            .courtId(court.getId())
            .courtName(court.getName())
            .sport(court.getSport())
            .venueId(venue.getId())
            .venueName(venue.getName())
            .venueAddress(venue.getAddress())
            .build();
    }
}
