package com.doctorappointment.auth_service.dto;

import com.doctorappointment.auth_service.entity.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest
{
   private String email;
   private String password;
   private Role role;
}
