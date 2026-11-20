package com.doctorappointment.auth_service.service;

import com.doctorappointment.auth_service.dto.LoginRequest;
import com.doctorappointment.auth_service.dto.LoginResult;
import com.doctorappointment.auth_service.dto.RegisterRequest;
import com.doctorappointment.auth_service.dto.RegisterResponse;
import com.doctorappointment.auth_service.dto.AdminUserResponse;

import com.doctorappointment.auth_service.entity.AccountStatus;
import com.doctorappointment.auth_service.entity.RefreshToken;
import com.doctorappointment.auth_service.entity.User;
import com.doctorappointment.auth_service.entity.Role;

import com.doctorappointment.auth_service.repository.UserRepository;
import com.doctorappointment.auth_service.util.JwtUtil;

import java.time.Instant;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final Duration SESSION_DURATION =
            Duration.ofDays(30);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            RefreshTokenService refreshTokenService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    // Check whether email already exists
    public boolean checkEmail(String email) {

        return userRepository.findByEmail(email).isPresent();
    }

    // Registration
    public RegisterResponse registerUser(RegisterRequest registerRequest) {

        if (checkEmail(registerRequest.getEmail())) {

            throw new RuntimeException("Email already registered");
        }

        String encodedPassword =
                passwordEncoder.encode(registerRequest.getPassword());

        User user = new User();

        user.setEmail(registerRequest.getEmail());
        user.setPassword(encodedPassword);
        user.setRole(registerRequest.getRole());
        user.setAccountStatus(AccountStatus.ACTIVE);

        User savedUser = userRepository.save(user);

        RegisterResponse response = new RegisterResponse();

        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());

        return response;
    }

    // Login
    public LoginResult loginUser(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Invalid email or password."
                        ));

        // Check blocked account
        if (user.getAccountStatus() == AccountStatus.BLOCKED) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account has been blocked. Please contact support."
            );
        }

        // Check password
        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password."
            );
        }

        // Generate access JWT
        String jwt = jwtUtil.generateToken(user);

        // Fixed 30-day session expiry
        Instant expiryDate = Instant.now().plus(SESSION_DURATION);

        // Create hashed refresh token
        String refreshToken =
                refreshTokenService.createRefreshToken(user, expiryDate);

        LoginResult result = new LoginResult();

        result.setJwtToken(jwt);
        result.setRefreshToken(refreshToken);
        result.setRole(user.getRole().name());
        result.setExpiryDate(expiryDate);

        return result;
    }

    // Refresh access JWT and rotate refresh token
    public LoginResult refreshSession(String rawRefreshToken) {

        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token is missing."
            );
        }

        RefreshToken storedToken;

        try {

            storedToken =
                    refreshTokenService.findByRawToken(rawRefreshToken);

        } catch (RuntimeException exception) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Your session has expired. Please login again."
            );
        }

        // Check original session expiry
        if (!storedToken.getExpiryDate().isAfter(Instant.now())) {

            refreshTokenService.deleteExpiredToken(storedToken);

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Your session has expired. Please login again."
            );
        }

        User user = storedToken.getUser();

        // Reject blocked accounts
        if (user.getAccountStatus() == AccountStatus.BLOCKED) {

            refreshTokenService.deleteAllByUser(user);

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account has been blocked. Please contact support."
            );
        }

        // Generate new access JWT
        String newJwt = jwtUtil.generateToken(user);

        // Rotate refresh token
        String newRefreshToken =
                refreshTokenService.rotateRefreshToken(storedToken);

        LoginResult result = new LoginResult();

        result.setJwtToken(newJwt);
        result.setRefreshToken(newRefreshToken);
        result.setRole(user.getRole().name());
        result.setExpiryDate(storedToken.getExpiryDate());

        return result;
    }

    // Block a PATIENT or DOCTOR account
    @Transactional
    public String blockUser(int userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));

        if (user.getRole() == Role.ADMIN) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admin accounts cannot be blocked"
            );
        }

        if (user.getAccountStatus() == AccountStatus.BLOCKED) {

            return "User account is already blocked";
        }

        user.setAccountStatus(AccountStatus.BLOCKED);

        userRepository.save(user);

        // Invalidate all refresh tokens
        refreshTokenService.deleteAllByUser(user);

        return "User account blocked successfully";
    }

    // Unblock a PATIENT or DOCTOR account
    @Transactional
    public String unblockUser(int userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        ));

        if (user.getRole() == Role.ADMIN) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admin accounts cannot be managed"
            );
        }

        if (user.getAccountStatus() == AccountStatus.ACTIVE) {

            return "User account is already active";
        }

        user.setAccountStatus(AccountStatus.ACTIVE);

        userRepository.save(user);

        return "User account unblocked successfully";
    }

    // Get all users for Admin Dashboard
    public List<AdminUserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(user -> {

                    AdminUserResponse response =
                            new AdminUserResponse();

                    response.setId(user.getId());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole());
                    response.setAccountStatus(user.getAccountStatus());

                    return response;
                })
                .collect(Collectors.toList());
    }
}