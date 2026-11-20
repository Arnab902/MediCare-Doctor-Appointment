package com.doctorappointment.appoinment_service.security;

import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class ServiceJwtUtil
{
    private final SecretKey secretKey;

    public ServiceJwtUtil(@Value("${jwt.secret}") String secret)
    {
        secretKey = new SecretKeySpec(
                secret.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256"
        );
    }

    public String generateServiceToken()
    {
        Date now = new Date();

        return Jwts.builder()
                .claim("service", "appointment-service")
                .claim("role", "APPOINTMENT_SERVICE")
                .issuedAt(now)
                .expiration(
                        new Date(now.getTime() + 5 * 60 * 1000)
                )
                .signWith(secretKey)
                .compact();
    }
}