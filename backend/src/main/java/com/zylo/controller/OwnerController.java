package com.zylo.controller;

import com.zylo.domain.Court;
import com.zylo.dto.ApiResponse;
import com.zylo.dto.booking.BookingResponseDto;
import com.zylo.dto.venue.CreateVenueDto;
import com.zylo.dto.venue.UpdateVenueDto;
import com.zylo.dto.venue.VenueDetailDto;
import com.zylo.dto.venue.VenueListDto;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.BookingRepository;
import com.zylo.repository.CourtRepository;
import com.zylo.repository.VenueRepository;
import com.zylo.security.UserPrincipal;
import com.zylo.service.VenueService;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner")
@RequiredArgsConstructor
public class OwnerController {

    private final VenueService venueService;
    private final VenueRepository venueRepository;
    private final CourtRepository courtRepository;
    private final BookingRepository bookingRepository;

    @GetMapping("/venues")
    public ResponseEntity<ApiResponse<List<VenueListDto>>> getMyVenues() {
        List<VenueListDto> venues = venueService.getOwnerVenues(
            UserPrincipal.getCurrentUserId()
        );
        return ResponseEntity.ok(ApiResponse.success(venues));
    }

    @PostMapping("/venues")
    public ResponseEntity<ApiResponse<VenueDetailDto>> createVenue(
            @Valid @RequestBody CreateVenueDto request) {
        VenueDetailDto venue = venueService.createVenue(
            UserPrincipal.getCurrentUser(),
            request
        );
        return ResponseEntity.ok(ApiResponse.success(venue));
    }

    @PutMapping("/venues/{venueId}")
    public ResponseEntity<ApiResponse<VenueDetailDto>> updateVenue(
            @PathVariable UUID venueId,
            @Valid @RequestBody UpdateVenueDto request) {
        VenueDetailDto venue = venueService.updateVenue(
            venueId,
            UserPrincipal.getCurrentUser(),
            request
        );
        return ResponseEntity.ok(ApiResponse.success(venue));
    }

    @PostMapping("/courts")
    public ResponseEntity<ApiResponse<VenueDetailDto.CourtDto>> addCourt(
            @Valid @RequestBody CreateCourtDto request) {

        var venue = venueRepository.findById(request.getVenueId())
            .orElseThrow(() -> new ApiException(ErrorCode.VENUE_NOT_FOUND));

        if (!venue.getOwner().getId().equals(UserPrincipal.getCurrentUserId())) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        if (courtRepository.existsByVenueIdAndNameAndActiveTrue(request.getVenueId(), request.getName())) {
            throw new ApiException(ErrorCode.COURT_ALREADY_EXISTS);
        }

        Court court = Court.builder()
            .venue(venue)
            .name(request.getName())
            .sport(request.getSport())
            .pricePerHour(request.getPricePerHour())
            .description(request.getDescription())
            .build();

        court = courtRepository.save(court);

        return ResponseEntity.ok(ApiResponse.success(VenueDetailDto.CourtDto.fromEntity(court)));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<Page<BookingResponseDto>>> getVenueBookings(
            @RequestParam UUID venueId,
            @PageableDefault(size = 20) Pageable pageable) {

        var venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new ApiException(ErrorCode.VENUE_NOT_FOUND));

        if (!venue.getOwner().getId().equals(UserPrincipal.getCurrentUserId())) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        Page<BookingResponseDto> bookings = bookingRepository.findByVenueId(venueId, pageable)
            .map(BookingResponseDto::fromEntity);

        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @Data
    public static class CreateCourtDto {
        private UUID venueId;
        private String name;
        private String sport;
        private BigDecimal pricePerHour;
        private String description;
    }
}
