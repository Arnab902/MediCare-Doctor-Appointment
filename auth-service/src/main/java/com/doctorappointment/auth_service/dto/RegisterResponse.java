package com.doctorappointment.auth_service.dto;

import com.doctorappointment.auth_service.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterResponse
{
    private int id;
    private String email;
    private Role role;
}
