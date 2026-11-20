package com.doctorappointment.patient_service.dto;

import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientPatchDTO
{
    private String fullName;

    @Email(message = "Please enter a valid email")
    private String email;

    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
}