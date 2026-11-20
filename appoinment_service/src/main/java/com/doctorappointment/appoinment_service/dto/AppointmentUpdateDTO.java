package com.doctorappointment.appoinment_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentUpdateDTO
{
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;
}
