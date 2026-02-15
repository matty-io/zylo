package com.zylo.repository;

import com.zylo.domain.Game;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GameRepository extends JpaRepository<Game, UUID> {

    Optional<Game> findByBookingId(UUID bookingId);

    @Query("""
        SELECT g FROM Game g
        JOIN FETCH g.booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        JOIN FETCH g.creator
        WHERE g.id = :gameId
        """)
    Optional<Game> findByIdWithAllDetails(UUID gameId);

    @Query(value = """
        SELECT DISTINCT g FROM Game g
        JOIN FETCH g.booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        WHERE g.isPublic = true
        AND g.status = 'ACTIVE'
        AND s.date >= :fromDate
        ORDER BY s.date, s.startTime
        """,
        countQuery = """
        SELECT COUNT(DISTINCT g) FROM Game g
        JOIN g.booking b
        JOIN b.slot s
        WHERE g.isPublic = true
        AND g.status = 'ACTIVE'
        AND s.date >= :fromDate
        """)
    Page<Game> findPublicGames(LocalDate fromDate, Pageable pageable);

    @Query(value = """
        SELECT DISTINCT g FROM Game g
        JOIN FETCH g.booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        WHERE g.isPublic = true
        AND g.status = 'ACTIVE'
        AND g.sport = :sport
        AND s.date >= :fromDate
        ORDER BY s.date, s.startTime
        """,
        countQuery = """
        SELECT COUNT(DISTINCT g) FROM Game g
        JOIN g.booking b
        JOIN b.slot s
        WHERE g.isPublic = true
        AND g.status = 'ACTIVE'
        AND g.sport = :sport
        AND s.date >= :fromDate
        """)
    Page<Game> findPublicGamesBySport(String sport, LocalDate fromDate, Pageable pageable);

    @Query(value = """
        SELECT DISTINCT g FROM Game g
        JOIN FETCH g.booking b
        JOIN FETCH b.slot s
        JOIN FETCH s.court c
        JOIN FETCH c.venue v
        WHERE g.isPublic = true
        AND g.status = 'ACTIVE'
        AND v.city = :city
        AND s.date >= :fromDate
        ORDER BY s.date, s.startTime
        """,
        countQuery = """
        SELECT COUNT(DISTINCT g) FROM Game g
        JOIN g.booking b
        JOIN b.slot s
        JOIN s.court c
        JOIN c.venue v
        WHERE g.isPublic = true
        AND g.status = 'ACTIVE'
        AND v.city = :city
        AND s.date >= :fromDate
        """)
    Page<Game> findPublicGamesByCity(String city, LocalDate fromDate, Pageable pageable);

    @Query(value = """
        SELECT g FROM Game g
        JOIN g.participants p
        WHERE p.user.id = :userId
        AND p.status = 'JOINED'
        AND g.status = 'ACTIVE'
        """,
        countQuery = """
        SELECT COUNT(g) FROM Game g
        JOIN g.participants p
        WHERE p.user.id = :userId
        AND p.status = 'JOINED'
        AND g.status = 'ACTIVE'
        """)
    Page<Game> findGamesForUser(UUID userId, Pageable pageable);

    Page<Game> findByCreatorId(UUID creatorId, Pageable pageable);
}
