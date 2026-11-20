package com.doctorappointment.auth_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {

    private String jwtToken;
    private String role;
}