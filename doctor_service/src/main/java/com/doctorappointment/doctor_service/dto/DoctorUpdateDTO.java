package com.doctorappointment.doctor_service.dto;

import jakarta.validation.Valid;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DoctorUpdateDTO
{
    private String fullName;

    private String email;

    private String phoneNumber;

    private String specialization;

    private String qualification;

    private Integer exp;

    private String language;

    private String profileImage;

    private Boolean availability;

    @Valid
    private List<DoctorLocationDTO> locations;
}