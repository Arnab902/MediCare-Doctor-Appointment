package com.doctorappointment.auth_service.service;

import com.doctorappointment.auth_service.entity.RefreshToken;
import com.doctorappointment.auth_service.entity.User;
import com.doctorappointment.auth_service.repository.RefreshTokenRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository) {

        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Generate a secure random refresh token
    private String generateToken() {

        byte[] randomBytes = new byte[32];

        SECURE_RANDOM.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    // Convert raw token into SHA-256 hash
    private String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hashedBytes =
                    digest.digest(token.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(hashedBytes);

        } catch (NoSuchAlgorithmException exception) {

            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    exception
            );
        }
    }

    // Create refresh token for a new login
    @Transactional
    public String createRefreshToken(User user, Instant expiryDate) {

        String rawToken = generateToken();

        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setTokenHash(hashToken(rawToken));
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(expiryDate);

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    // Find refresh token using its hash
    @Transactional(readOnly = true)
    public RefreshToken findByRawToken(String rawToken) {

        String tokenHash = hashToken(rawToken);

        return refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() ->
                        new RuntimeException("Refresh token not found"));
    }

    // Delete expired token
    @Transactional
    public void deleteExpiredToken(RefreshToken refreshToken) {

        refreshTokenRepository.deleteById(refreshToken.getId());
    }

    // Rotate refresh token while preserving original expiry
    @Transactional
    public String rotateRefreshToken(RefreshToken oldToken) {

        String newRawToken = generateToken();

        RefreshToken newToken = new RefreshToken();

        newToken.setTokenHash(hashToken(newRawToken));
        newToken.setUser(oldToken.getUser());
        newToken.setExpiryDate(oldToken.getExpiryDate());

        refreshTokenRepository.delete(oldToken);

        refreshTokenRepository.flush();

        refreshTokenRepository.save(newToken);

        return newRawToken;
    }

    // Delete one refresh token
    @Transactional
    public void deleteByRawToken(String rawToken)
    {
        refreshTokenRepository.deleteByTokenHash(hashToken(rawToken));
    }

    // Delete all refresh tokens belonging to a user
    @Transactional
    public void deleteAllByUser(User user)
    {
        List<RefreshToken> tokens = refreshTokenRepository.findAllByUser(user);

        refreshTokenRepository.deleteAll(tokens);
    }
}