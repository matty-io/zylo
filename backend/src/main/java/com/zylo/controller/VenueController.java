package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.slot.SlotsByCourtDto;
import com.zylo.dto.venue.VenueDetailDto;
import com.zylo.dto.venue.VenueFilterDto;
import com.zylo.dto.venue.VenueListDto;
import com.zylo.service.SlotService;
import com.zylo.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;
    private final SlotService slotService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VenueListDto>>> getVenues(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String sport,
            @PageableDefault(size = 20) Pageable pageable) {

        VenueFilterDto filter = new VenueFilterDto();
        filter.setCity(city);
        filter.setSport(sport);

        Page<VenueListDto> venues = venueService.getVenues(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(venues));
    }

    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<VenueListDto>>> getNearbyVenues(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm) {

        List<VenueListDto> venues = venueService.getNearbyVenues(lat, lng, radiusKm);
        return ResponseEntity.ok(ApiResponse.success(venues));
    }

    @GetMapping("/{venueId}")
    public ResponseEntity<ApiResponse<VenueDetailDto>> getVenueDetails(
            @PathVariable UUID venueId) {
        VenueDetailDto venue = venueService.getVenueDetails(venueId);
        return ResponseEntity.ok(ApiResponse.success(venue));
    }

    @GetMapping("/{venueId}/slots")
    public ResponseEntity<ApiResponse<List<SlotsByCourtDto>>> getVenueSlots(
            @PathVariable UUID venueId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<SlotsByCourtDto> slots = slotService.getVenueSlots(venueId, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }
}
