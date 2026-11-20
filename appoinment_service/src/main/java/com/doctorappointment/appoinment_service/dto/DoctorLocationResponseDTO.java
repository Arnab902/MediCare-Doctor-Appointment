package com.doctorappointment.appoinment_service.dto;

import com.doctorappointment.appoinment_service.entity.ConsultationType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DoctorLocationResponseDTO
{
    private int id;
    private String locationName;
    private ConsultationType consultationType;
    private double consultationFee;
    private Boolean active;
}