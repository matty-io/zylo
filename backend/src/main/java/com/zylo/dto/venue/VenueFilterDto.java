package com.zylo.dto.venue;

import lombok.Data;

@Data
public class VenueFilterDto {
    private String city;
    private String sport;
    private Double lat;
    private Double lng;
    private Double radiusKm;
}
