package com.doctorappointment.appoinment_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorResponseDTO
{
    private int id;
    private String fullName;
    private String specialization;
    private Boolean availability;
}
