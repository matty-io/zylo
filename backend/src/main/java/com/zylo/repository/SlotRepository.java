package com.zylo.repository;

import com.zylo.domain.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SlotRepository extends JpaRepository<Slot, UUID> {

    @Query("""
        SELECT s FROM Slot s
        JOIN FETCH s.court c
        WHERE c.venue.id = :venueId
        AND s.date = :date
        AND c.active = true
        ORDER BY c.name, s.startTime
        """)
    List<Slot> findByVenueIdAndDate(UUID venueId, LocalDate date);

    @Query("SELECT s FROM Slot s WHERE s.court.id = :courtId AND s.date = :date ORDER BY s.startTime")
    List<Slot> findByCourtIdAndDate(UUID courtId, LocalDate date);

    @Query("""
        SELECT s FROM Slot s
        WHERE s.court.id = :courtId
        AND s.date = :date
        AND s.status = 'AVAILABLE'
        ORDER BY s.startTime
        """)
    List<Slot> findAvailableSlots(UUID courtId, LocalDate date);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Slot s WHERE s.id = :slotId")
    Optional<Slot> findByIdWithLock(UUID slotId);

    @Modifying
    @Query("UPDATE Slot s SET s.status = :status WHERE s.id = :slotId")
    void updateStatus(UUID slotId, Slot.SlotStatus status);

    @Query("""
        SELECT s FROM Slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        WHERE s.id = :slotId
        """)
    Optional<Slot> findByIdWithCourtAndVenue(UUID slotId);
}
