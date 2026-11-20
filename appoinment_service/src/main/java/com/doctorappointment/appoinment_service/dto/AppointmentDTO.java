package com.doctorappointment.appoinment_service.dto;

import com.doctorappointment.appoinment_service.entity.ConsultationType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentDTO
{
    @NotNull
    @Positive
    private Integer patientId;

    @NotNull
    @Positive
    private Integer doctorId;

    @NotNull
    @Positive
    private Integer doctorLocationId;

    @NotNull
    @FutureOrPresent
    private LocalDate appointmentDate;

    @NotNull
    private LocalTime appointmentTime;

    @NotNull
    private ConsultationType consultationType;

    @NotBlank
    private String reason;
}
