package com.zylo.dto.venue;

import com.zylo.domain.Venue;
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
public class VenueListDto {

    private UUID id;
    private String name;
    private String address;
    private String city;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<String> supportedSports;
    private String primaryImage;
    private BigDecimal minPrice;

    public static VenueListDto fromEntity(Venue venue) {
        BigDecimal minPrice = venue.getCourts().stream()
            .filter(c -> c.isActive())
            .map(c -> c.getPricePerHour())
            .min(BigDecimal::compareTo)
            .orElse(null);

        String primaryImage = venue.getImages() != null && !venue.getImages().isEmpty()
            ? venue.getImages().get(0)
            : null;

        return VenueListDto.builder()
            .id(venue.getId())
            .name(venue.getName())
            .address(venue.getAddress())
            .city(venue.getCity())
            .latitude(venue.getLatitude())
            .longitude(venue.getLongitude())
            .supportedSports(venue.getSupportedSports())
            .primaryImage(primaryImage)
            .minPrice(minPrice)
            .build();
    }
}
