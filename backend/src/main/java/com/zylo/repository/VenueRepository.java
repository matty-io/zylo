package com.zylo.repository;

import com.zylo.domain.Venue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VenueRepository extends JpaRepository<Venue, UUID> {

    Page<Venue> findByActiveTrue(Pageable pageable);

    Page<Venue> findByCityAndActiveTrue(String city, Pageable pageable);

    @Query(value = """
        SELECT v.* FROM venues v
        WHERE v.is_active = true
        AND :sport = ANY(v.supported_sports)
        """, nativeQuery = true)
    Page<Venue> findBySportAndActiveTrue(String sport, Pageable pageable);

    @Query(value = """
        SELECT v.* FROM venues v
        WHERE v.is_active = true
        AND v.city = :city
        AND :sport = ANY(v.supported_sports)
        """, nativeQuery = true)
    Page<Venue> findByCityAndSportAndActiveTrue(String city, String sport, Pageable pageable);

    List<Venue> findByOwnerId(UUID ownerId);

    @Query(value = """
        SELECT v.*, earth_distance(
            ll_to_earth(v.latitude, v.longitude),
            ll_to_earth(:lat, :lng)
        ) as distance
        FROM venues v
        WHERE v.is_active = true
        AND earth_distance(
            ll_to_earth(v.latitude, v.longitude),
            ll_to_earth(:lat, :lng)
        ) <= :radiusMeters
        ORDER BY distance
        """, nativeQuery = true)
    List<Venue> findNearbyVenues(double lat, double lng, double radiusMeters);
}
