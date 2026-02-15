package com.zylo.service;

import com.zylo.domain.User;
import com.zylo.domain.Venue;
import com.zylo.dto.venue.*;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;

    @Transactional(readOnly = true)
    public Page<VenueListDto> getVenues(VenueFilterDto filter, Pageable pageable) {
        Page<Venue> venues;

        if (filter.getCity() != null && filter.getSport() != null) {
            venues = venueRepository.findByCityAndSportAndActiveTrue(
                filter.getCity(), filter.getSport(), pageable);
        } else if (filter.getCity() != null) {
            venues = venueRepository.findByCityAndActiveTrue(filter.getCity(), pageable);
        } else if (filter.getSport() != null) {
            venues = venueRepository.findBySportAndActiveTrue(filter.getSport(), pageable);
        } else {
            venues = venueRepository.findByActiveTrue(pageable);
        }

        return venues.map(VenueListDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<VenueListDto> getNearbyVenues(double lat, double lng, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        return venueRepository.findNearbyVenues(lat, lng, radiusMeters)
            .stream()
            .map(VenueListDto::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public VenueDetailDto getVenueDetails(UUID venueId) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new ApiException(ErrorCode.VENUE_NOT_FOUND));

        if (!venue.isActive()) {
            throw new ApiException(ErrorCode.VENUE_INACTIVE);
        }

        return VenueDetailDto.fromEntity(venue);
    }

    @Transactional
    public VenueDetailDto createVenue(User owner, CreateVenueDto request) {
        Venue venue = Venue.builder()
            .owner(owner)
            .name(request.getName())
            .address(request.getAddress())
            .city(request.getCity())
            .latitude(request.getLatitude())
            .longitude(request.getLongitude())
            .supportedSports(request.getSupportedSports())
            .images(request.getImages())
            .description(request.getDescription())
            .amenities(request.getAmenities())
            .openingTime(request.getOpeningTime())
            .closingTime(request.getClosingTime())
            .build();

        venue = venueRepository.save(venue);
        log.info("Venue created: {} by owner: {}", venue.getId(), owner.getId());

        return VenueDetailDto.fromEntity(venue);
    }

    @Transactional
    public VenueDetailDto updateVenue(UUID venueId, User owner, UpdateVenueDto request) {
        Venue venue = venueRepository.findById(venueId)
            .orElseThrow(() -> new ApiException(ErrorCode.VENUE_NOT_FOUND));

        if (!venue.getOwner().getId().equals(owner.getId())) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        if (request.getName() != null) venue.setName(request.getName());
        if (request.getAddress() != null) venue.setAddress(request.getAddress());
        if (request.getDescription() != null) venue.setDescription(request.getDescription());
        if (request.getSupportedSports() != null) venue.setSupportedSports(request.getSupportedSports());
        if (request.getImages() != null) venue.setImages(request.getImages());
        if (request.getAmenities() != null) venue.setAmenities(request.getAmenities());
        if (request.getOpeningTime() != null) venue.setOpeningTime(request.getOpeningTime());
        if (request.getClosingTime() != null) venue.setClosingTime(request.getClosingTime());
        if (request.getActive() != null) venue.setActive(request.getActive());

        venue = venueRepository.save(venue);
        log.info("Venue updated: {}", venue.getId());

        return VenueDetailDto.fromEntity(venue);
    }

    @Transactional(readOnly = true)
    public List<VenueListDto> getOwnerVenues(UUID ownerId) {
        return venueRepository.findByOwnerId(ownerId)
            .stream()
            .map(VenueListDto::fromEntity)
            .toList();
    }
}
