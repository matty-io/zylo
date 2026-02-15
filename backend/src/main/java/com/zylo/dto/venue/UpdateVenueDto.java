package com.zylo.dto.venue;

import lombok.Data;

import java.time.LocalTime;
import java.util.List;

@Data
public class UpdateVenueDto {

    private String name;
    private String address;
    private String description;
    private List<String> supportedSports;
    private List<String> images;
    private List<String> amenities;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private Boolean active;
}
