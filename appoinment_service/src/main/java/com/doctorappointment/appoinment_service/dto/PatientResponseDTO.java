package com.doctorappointment.appoinment_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientResponseDTO
{
    private int id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
}
