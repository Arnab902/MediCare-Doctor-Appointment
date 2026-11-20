package com.doctorappointment.doctor_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DoctorResponseDTO
{
    private int id;

    private String fullName;

    private String email;

    private String phoneNumber;

    private String specialization;

    private String qualification;

    private int exp;

    private String language;

    private String profileImage;

    private Boolean availability;

    private List<DoctorLocationDTO> locations;
}