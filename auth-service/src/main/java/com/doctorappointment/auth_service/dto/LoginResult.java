package com.doctorappointment.auth_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class LoginResult
{
    private String jwtToken;
    private String refreshToken;
    private String role;
    private Instant expiryDate;
}