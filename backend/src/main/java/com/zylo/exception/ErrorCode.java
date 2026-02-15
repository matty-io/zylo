package com.zylo.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Authentication errors
    INVALID_OTP("AUTH_001", "Invalid OTP", HttpStatus.UNAUTHORIZED),
    OTP_EXPIRED("AUTH_002", "OTP has expired", HttpStatus.UNAUTHORIZED),
    OTP_SEND_FAILED("AUTH_003", "Failed to send OTP", HttpStatus.INTERNAL_SERVER_ERROR),
    TOO_MANY_OTP_REQUESTS("AUTH_004", "Too many OTP requests. Please try again later", HttpStatus.TOO_MANY_REQUESTS),
    INVALID_TOKEN("AUTH_005", "Invalid token", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED("AUTH_006", "Token has expired", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN("AUTH_007", "Invalid refresh token", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED("AUTH_008", "Refresh token has expired", HttpStatus.UNAUTHORIZED),

    // User errors
    USER_NOT_FOUND("USER_001", "User not found", HttpStatus.NOT_FOUND),
    USER_BLOCKED("USER_002", "User account is blocked", HttpStatus.FORBIDDEN),
    UNAUTHORIZED("USER_003", "Unauthorized access", HttpStatus.UNAUTHORIZED),

    // Venue errors
    VENUE_NOT_FOUND("VENUE_001", "Venue not found", HttpStatus.NOT_FOUND),
    VENUE_INACTIVE("VENUE_002", "Venue is not active", HttpStatus.BAD_REQUEST),

    // Court errors
    COURT_NOT_FOUND("COURT_001", "Court not found", HttpStatus.NOT_FOUND),
    COURT_ALREADY_EXISTS("COURT_002", "Court with this name already exists", HttpStatus.CONFLICT),

    // Slot errors
    SLOT_NOT_FOUND("SLOT_001", "Slot not found", HttpStatus.NOT_FOUND),
    SLOT_NOT_AVAILABLE("SLOT_002", "Slot is not available", HttpStatus.CONFLICT),
    SLOT_ALREADY_BOOKED("SLOT_003", "Slot has already been booked", HttpStatus.CONFLICT),
    SLOT_IN_PAST("SLOT_004", "Cannot book a slot in the past", HttpStatus.BAD_REQUEST),

    // Booking errors
    BOOKING_NOT_FOUND("BOOKING_001", "Booking not found", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED("BOOKING_002", "Booking has already been cancelled", HttpStatus.BAD_REQUEST),
    BOOKING_CANNOT_CANCEL("BOOKING_003", "Cannot cancel this booking", HttpStatus.BAD_REQUEST),
    BOOKING_LOCK_FAILED("BOOKING_004", "Could not acquire lock for booking. Please try again", HttpStatus.CONFLICT),
    DUPLICATE_BOOKING("BOOKING_005", "Duplicate booking request", HttpStatus.CONFLICT),

    // Payment errors
    PAYMENT_FAILED("PAYMENT_001", "Payment failed", HttpStatus.PAYMENT_REQUIRED),
    PAYMENT_NOT_FOUND("PAYMENT_002", "Payment not found", HttpStatus.NOT_FOUND),
    INVALID_PAYMENT_SIGNATURE("PAYMENT_003", "Invalid payment signature", HttpStatus.BAD_REQUEST),
    REFUND_FAILED("PAYMENT_004", "Refund failed", HttpStatus.INTERNAL_SERVER_ERROR),

    // Game errors
    GAME_NOT_FOUND("GAME_001", "Game not found", HttpStatus.NOT_FOUND),
    GAME_FULL("GAME_002", "Game is full", HttpStatus.CONFLICT),
    ALREADY_JOINED("GAME_003", "Already joined this game", HttpStatus.CONFLICT),
    NOT_PARTICIPANT("GAME_004", "Not a participant of this game", HttpStatus.BAD_REQUEST),
    CANNOT_LEAVE_OWN_GAME("GAME_005", "Cannot leave a game you created", HttpStatus.BAD_REQUEST),
    GAME_ALREADY_EXISTS("GAME_006", "A game already exists for this booking", HttpStatus.CONFLICT),

    // Validation errors
    VALIDATION_ERROR("VAL_001", "Validation error", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST("VAL_002", "Invalid request", HttpStatus.BAD_REQUEST),

    // System errors
    INTERNAL_ERROR("SYS_001", "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE("SYS_002", "Service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE);

    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
