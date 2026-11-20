package com.doctorappointment.auth_service.controller;

import com.doctorappointment.auth_service.dto.LoginRequest;
import com.doctorappointment.auth_service.dto.LoginResponse;
import com.doctorappointment.auth_service.dto.LoginResult;
import com.doctorappointment.auth_service.dto.RegisterRequest;
import com.doctorappointment.auth_service.dto.RegisterResponse;

import com.doctorappointment.auth_service.service.AuthService;
import com.doctorappointment.auth_service.service.RefreshTokenService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;

@RestController
public class AuthRestController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    public AuthRestController(
            AuthService authService,
            RefreshTokenService refreshTokenService) {

        this.authService = authService;
        this.refreshTokenService = refreshTokenService;
    }

    // Register
    @PostMapping("/auth/register")
    public RegisterResponse register(
            @RequestBody RegisterRequest registerRequest) {

        return authService.registerUser(registerRequest);
    }

    // Login
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest) {

        try {

            LoginResult result =
                    authService.loginUser(loginRequest);

            LoginResponse response = new LoginResponse();

            response.setJwtToken(result.getJwtToken());
            response.setRole(result.getRole());

            ResponseCookie refreshCookie =
                    createRefreshCookie(
                            result.getRefreshToken(),
                            result.getExpiryDate()
                    );

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.SET_COOKIE,
                            refreshCookie.toString()
                    )
                    .body(response);

        } catch (ResponseStatusException exception) {

            return ResponseEntity
                    .status(exception.getStatusCode())
                    .body(Map.of(
                            "message",
                            exception.getReason() != null
                                    ? exception.getReason()
                                    : "Login failed."
                    ));
        }
    }

    // Refresh access JWT using HttpOnly cookie
    @PostMapping("/auth/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(
                    name = "refreshToken",
                    required = false
            ) String refreshToken) {

        try {

            LoginResult result =
                    authService.refreshSession(refreshToken);

            LoginResponse response = new LoginResponse();

            response.setJwtToken(result.getJwtToken());
            response.setRole(result.getRole());

            ResponseCookie refreshCookie =
                    createRefreshCookie(
                            result.getRefreshToken(),
                            result.getExpiryDate()
                    );

            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.SET_COOKIE,
                            refreshCookie.toString()
                    )
                    .body(response);

        } catch (ResponseStatusException exception) {

            return ResponseEntity
                    .status(exception.getStatusCode())
                    .body(Map.of(
                            "message",
                            exception.getReason() != null
                                    ? exception.getReason()
                                    : "Session refresh failed."
                    ));
        }
    }

    // Logout
    @PostMapping("/auth/logout")
    public ResponseEntity<String> logout(
            @CookieValue(
                    name = "refreshToken",
                    required = false
            ) String refreshToken) {

        if (refreshToken != null && !refreshToken.isBlank()) {

            refreshTokenService.deleteByRawToken(refreshToken);
        }

        ResponseCookie clearCookie =
                ResponseCookie.from("refreshToken", "")
                        .httpOnly(true)
                        .secure(secureCookie)
                        .sameSite("Lax")
                        .path("/auth")
                        .maxAge(Duration.ZERO)
                        .build();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.SET_COOKIE,
                        clearCookie.toString()
                )
                .body("Logout successful");
    }

    // Protected endpoint for testing JWT authentication
    @GetMapping("/auth/profile")
    public String profile() {

        return "You are authenticated successfully!";
    }

    // Create persistent 30-day refresh cookie
    private ResponseCookie createRefreshCookie(
            String refreshToken,
            Instant expiryDate) {

        Duration remainingTime = Duration.between(Instant.now(), expiryDate);

        if (remainingTime.isNegative() || remainingTime.isZero()) {

            remainingTime = Duration.ZERO;
        }

        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Lax")
                .path("/auth")
                .maxAge(remainingTime)
                .build();
    }
}