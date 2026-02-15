package com.zylo.repository;

import com.zylo.domain.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourtRepository extends JpaRepository<Court, UUID> {

    List<Court> findByVenueIdAndActiveTrue(UUID venueId);

    List<Court> findByVenueIdAndSportAndActiveTrue(UUID venueId, String sport);

    @Query("SELECT c FROM Court c WHERE c.venue.id = :venueId AND c.active = true ORDER BY c.sport, c.name")
    List<Court> findActiveCourtsByVenueOrdered(UUID venueId);

    boolean existsByVenueIdAndNameAndActiveTrue(UUID venueId, String name);
}
