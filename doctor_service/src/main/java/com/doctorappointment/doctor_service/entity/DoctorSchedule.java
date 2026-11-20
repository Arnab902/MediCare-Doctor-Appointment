package com.doctorappointment.doctor_service.entity;

import com.doctorappointment.doctor_service.entity.DoctorLocation;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_schedules")
@Getter
@Setter
public class DoctorSchedule
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "doctor_location_id")
    private DoctorLocation doctorLocation;
}
