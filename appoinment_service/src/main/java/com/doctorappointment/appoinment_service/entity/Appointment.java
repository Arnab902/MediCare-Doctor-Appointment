package com.doctorappointment.appoinment_service.entity;

import com.doctorappointment.appoinment_service.entity.AppointmentStatus;
import com.doctorappointment.appoinment_service.entity.RescheduleRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointment_db")
@Getter
@Setter
public class Appointment
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    int id;

    int patientId;
    int doctorId;
    int doctorLocationId;

    // Actual confirmed appointment date and time
    LocalDate appointmentDate;
    LocalTime appointmentTime;

    // Requested date and time for rescheduling
    LocalDate requestedAppointmentDate;
    LocalTime requestedAppointmentTime;

    @Enumerated(EnumType.STRING)
    AppointmentStatus status;

    @Enumerated(EnumType.STRING)
    ConsultationType consultationType;

    @Enumerated(EnumType.STRING)
    RescheduleRequestStatus rescheduleRequestStatus;

    String reason;
}
