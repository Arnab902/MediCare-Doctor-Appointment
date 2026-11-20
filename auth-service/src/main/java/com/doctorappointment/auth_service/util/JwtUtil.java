package com.doctorappointment.auth_service.util;

import com.doctorappointment.auth_service.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil
{
    private final SecretKey SECRET_KEY;

    public JwtUtil(@Value("${jwt.secret}") String secret)
    {
        SECRET_KEY = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    public String generateToken(User user)
    {
        return Jwts.builder()
                .claim("userId", user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole())
                .expiration(new Date(System.currentTimeMillis() + 60 * 60 * 1000))
                .signWith(SECRET_KEY)
                .compact();
    }

    public Claims extractClaims(String token)
    {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}