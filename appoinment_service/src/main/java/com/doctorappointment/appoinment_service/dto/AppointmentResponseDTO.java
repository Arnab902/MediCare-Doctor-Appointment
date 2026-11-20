package com.doctorappointment.appoinment_service.dto;

import com.doctorappointment.appoinment_service.entity.AppointmentStatus;
import com.doctorappointment.appoinment_service.entity.ConsultationType;
import com.doctorappointment.appoinment_service.entity.RescheduleRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AppointmentResponseDTO
{
    private int id;

    private int patientId;
    private String patientName;

    private int doctorId;
    private String doctorName;

    private int doctorLocationId;

    private LocalDate appointmentDate;
    private LocalTime appointmentTime;

    private LocalDate requestedAppointmentDate;
    private LocalTime requestedAppointmentTime;

    private AppointmentStatus status;
    private ConsultationType consultationType;
    private RescheduleRequestStatus rescheduleRequestStatus;

    private String reason;
}