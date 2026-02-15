package com.zylo.repository;

import com.zylo.domain.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Optional<Booking> findByIdempotencyKey(String idempotencyKey);

    @Query(value = """
        SELECT b FROM Booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        WHERE b.user.id = :userId
        ORDER BY b.createdAt DESC
        """,
        countQuery = """
        SELECT COUNT(b) FROM Booking b
        WHERE b.user.id = :userId
        """)
    Page<Booking> findByUserIdWithDetails(UUID userId, Pageable pageable);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        JOIN FETCH b.user u
        WHERE b.id = :bookingId
        """)
    Optional<Booking> findByIdWithAllDetails(UUID bookingId);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.slot.id = :slotId
        AND b.status IN ('PENDING', 'CONFIRMED')
        """)
    Optional<Booking> findActiveBookingForSlot(UUID slotId);

    @Query(value = """
        SELECT b FROM Booking b
        JOIN b.slot s
        JOIN s.court c
        WHERE c.venue.id = :venueId
        ORDER BY b.createdAt DESC
        """,
        countQuery = """
        SELECT COUNT(b) FROM Booking b
        JOIN b.slot s
        JOIN s.court c
        WHERE c.venue.id = :venueId
        """)
    Page<Booking> findByVenueId(UUID venueId, Pageable pageable);

    @Query("""
        SELECT b FROM Booking b
        WHERE b.status = 'PENDING'
        AND b.createdAt < :expiryTime
        """)
    List<Booking> findExpiredPendingBookings(LocalDateTime expiryTime);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        WHERE b.user.id = :userId
        AND b.status = 'CONFIRMED'
        AND s.date >= CURRENT_DATE
        ORDER BY s.date, s.startTime
        """)
    List<Booking> findUpcomingBookings(UUID userId);

    long countByUserIdAndStatus(UUID userId, Booking.BookingStatus status);
}
