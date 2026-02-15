package com.zylo.dto.venue;

import com.zylo.domain.Court;
import com.zylo.domain.Venue;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueDetailDto {

    private UUID id;
    private String name;
    private String address;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> supportedSports;
    private List<String> images;
    private String description;
    private List<String> amenities;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private List<CourtDto> courts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourtDto {
        private UUID id;
        private String name;
        private String sport;
        private BigDecimal pricePerHour;
        private String description;

        public static CourtDto fromEntity(Court court) {
            return CourtDto.builder()
                .id(court.getId())
                .name(court.getName())
                .sport(court.getSport())
                .pricePerHour(court.getPricePerHour())
                .description(court.getDescription())
                .build();
        }
    }

    public static VenueDetailDto fromEntity(Venue venue) {
        List<CourtDto> courts = venue.getCourts().stream()
            .filter(Court::isActive)
            .map(CourtDto::fromEntity)
            .toList();

        return VenueDetailDto.builder()
            .id(venue.getId())
            .name(venue.getName())
            .address(venue.getAddress())
            .city(venue.getCity())
            .latitude(venue.getLatitude())
            .longitude(venue.getLongitude())
            .supportedSports(venue.getSupportedSports())
            .images(venue.getImages())
            .description(venue.getDescription())
            .amenities(venue.getAmenities())
            .openingTime(venue.getOpeningTime())
            .closingTime(venue.getClosingTime())
            .courts(courts)
            .build();
    }
}
