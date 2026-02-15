package com.zylo.controller;

import com.zylo.dto.ApiResponse;
import com.zylo.dto.game.*;
import com.zylo.security.UserPrincipal;
import com.zylo.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping
    public ResponseEntity<ApiResponse<GameResponseDto>> createGame(
            @Valid @RequestBody CreateGameDto request) {
        GameResponseDto game = gameService.createGame(
            UserPrincipal.getCurrentUser(),
            request
        );
        return ResponseEntity.ok(ApiResponse.success(game));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GameListDto>>> getPublicGames(
            @RequestParam(required = false) String sport,
            @RequestParam(required = false) String city,
            @PageableDefault(size = 20) Pageable pageable) {

        GameFilterDto filter = new GameFilterDto();
        filter.setSport(sport);
        filter.setCity(city);

        Page<GameListDto> games = gameService.getPublicGames(filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(games));
    }

    @GetMapping("/{gameId}")
    public ResponseEntity<ApiResponse<GameResponseDto>> getGameDetails(
            @PathVariable UUID gameId) {
        GameResponseDto game = gameService.getGameDetails(gameId);
        return ResponseEntity.ok(ApiResponse.success(game));
    }

    @PostMapping("/{gameId}/join")
    public ResponseEntity<ApiResponse<GameResponseDto>> joinGame(
            @PathVariable UUID gameId) {
        GameResponseDto game = gameService.joinGame(
            gameId,
            UserPrincipal.getCurrentUser()
        );
        return ResponseEntity.ok(ApiResponse.success(game));
    }

    @PostMapping("/{gameId}/leave")
    public ResponseEntity<ApiResponse<GameResponseDto>> leaveGame(
            @PathVariable UUID gameId) {
        GameResponseDto game = gameService.leaveGame(
            gameId,
            UserPrincipal.getCurrentUser()
        );
        return ResponseEntity.ok(ApiResponse.success(game));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<GameListDto>>> getMyGames(
            @PageableDefault(size = 20) Pageable pageable) {
        Page<GameListDto> games = gameService.getMyGames(
            UserPrincipal.getCurrentUserId(),
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(games));
    }
}
