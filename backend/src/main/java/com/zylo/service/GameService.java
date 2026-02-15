package com.zylo.service;

import com.zylo.domain.*;
import com.zylo.dto.game.*;
import com.zylo.exception.ApiException;
import com.zylo.exception.ErrorCode;
import com.zylo.repository.BookingRepository;
import com.zylo.repository.GameParticipantRepository;
import com.zylo.repository.GameRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameParticipantRepository participantRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    @Transactional
    public GameResponseDto createGame(User creator, CreateGameDto request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new ApiException(ErrorCode.BOOKING_NOT_FOUND));

        // Verify ownership
        if (!booking.getUser().getId().equals(creator.getId())) {
            throw new ApiException(ErrorCode.UNAUTHORIZED);
        }

        // Check if booking is confirmed
        if (!booking.isConfirmed()) {
            throw new ApiException(ErrorCode.BOOKING_NOT_FOUND, "Booking must be confirmed to create a game");
        }

        // Check if game already exists for this booking
        if (gameRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new ApiException(ErrorCode.GAME_ALREADY_EXISTS);
        }

        Game game = Game.builder()
            .booking(booking)
            .creator(creator)
            .title(request.getTitle())
            .sport(booking.getSlot().getCourt().getSport())
            .maxPlayers(request.getMaxPlayers())
            .skillLevel(request.getSkillLevel())
            .description(request.getDescription())
            .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
            .build();

        // Add creator as first participant
        GameParticipant creatorParticipant = GameParticipant.builder()
            .game(game)
            .user(creator)
            .status(GameParticipant.ParticipantStatus.JOINED)
            .build();
        game.getParticipants().add(creatorParticipant);

        game = gameRepository.save(game);
        log.info("Game created: {} by user: {}", game.getId(), creator.getId());

        return GameResponseDto.fromEntity(game);
    }

    @Transactional(readOnly = true)
    public Page<GameListDto> getPublicGames(GameFilterDto filter, Pageable pageable) {
        LocalDate fromDate = LocalDate.now();
        Page<Game> games;

        if (filter != null && filter.getSport() != null) {
            games = gameRepository.findPublicGamesBySport(filter.getSport(), fromDate, pageable);
        } else if (filter != null && filter.getCity() != null) {
            games = gameRepository.findPublicGamesByCity(filter.getCity(), fromDate, pageable);
        } else {
            games = gameRepository.findPublicGames(fromDate, pageable);
        }

        return games.map(GameListDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public GameResponseDto getGameDetails(UUID gameId) {
        Game game = gameRepository.findByIdWithAllDetails(gameId)
            .orElseThrow(() -> new ApiException(ErrorCode.GAME_NOT_FOUND));

        List<GameParticipant> participants = participantRepository.findActiveParticipants(gameId);

        return GameResponseDto.fromEntityWithParticipants(game, participants);
    }

    @Transactional
    public GameResponseDto joinGame(UUID gameId, User user) {
        Game game = gameRepository.findByIdWithAllDetails(gameId)
            .orElseThrow(() -> new ApiException(ErrorCode.GAME_NOT_FOUND));

        // Check if game is full
        int currentPlayers = participantRepository.countActiveParticipants(gameId);
        if (currentPlayers >= game.getMaxPlayers()) {
            throw new ApiException(ErrorCode.GAME_FULL);
        }

        // Check if already joined
        if (participantRepository.existsByGameIdAndUserIdAndStatus(
                gameId, user.getId(), GameParticipant.ParticipantStatus.JOINED)) {
            throw new ApiException(ErrorCode.ALREADY_JOINED);
        }

        // Check for existing left participant and rejoin
        var existingParticipant = participantRepository.findByGameIdAndUserId(gameId, user.getId());
        if (existingParticipant.isPresent()) {
            var participant = existingParticipant.get();
            participant.setStatus(GameParticipant.ParticipantStatus.JOINED);
            participantRepository.save(participant);
        } else {
            GameParticipant participant = GameParticipant.builder()
                .game(game)
                .user(user)
                .status(GameParticipant.ParticipantStatus.JOINED)
                .build();
            participantRepository.save(participant);
        }

        log.info("User {} joined game {}", user.getId(), gameId);

        // Notify creator
        notificationService.sendGameJoinedNotification(game, user);

        List<GameParticipant> participants = participantRepository.findActiveParticipants(gameId);
        return GameResponseDto.fromEntityWithParticipants(game, participants);
    }

    @Transactional
    public GameResponseDto leaveGame(UUID gameId, User user) {
        Game game = gameRepository.findById(gameId)
            .orElseThrow(() -> new ApiException(ErrorCode.GAME_NOT_FOUND));

        // Cannot leave own game
        if (game.getCreator().getId().equals(user.getId())) {
            throw new ApiException(ErrorCode.CANNOT_LEAVE_OWN_GAME);
        }

        GameParticipant participant = participantRepository.findByGameIdAndUserId(gameId, user.getId())
            .orElseThrow(() -> new ApiException(ErrorCode.NOT_PARTICIPANT));

        if (participant.getStatus() != GameParticipant.ParticipantStatus.JOINED) {
            throw new ApiException(ErrorCode.NOT_PARTICIPANT);
        }

        participant.setStatus(GameParticipant.ParticipantStatus.LEFT);
        participantRepository.save(participant);

        log.info("User {} left game {}", user.getId(), gameId);

        Game refreshedGame = gameRepository.findByIdWithAllDetails(gameId).orElseThrow();
        List<GameParticipant> participants = participantRepository.findActiveParticipants(gameId);
        return GameResponseDto.fromEntityWithParticipants(refreshedGame, participants);
    }

    @Transactional(readOnly = true)
    public Page<GameListDto> getMyGames(UUID userId, Pageable pageable) {
        return gameRepository.findGamesForUser(userId, pageable)
            .map(GameListDto::fromEntity);
    }
}
