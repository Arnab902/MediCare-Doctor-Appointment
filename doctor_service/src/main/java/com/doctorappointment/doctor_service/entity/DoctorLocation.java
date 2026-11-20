package com.doctorappointment.doctor_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "doctor_locations")
@Getter
@Setter
public class DoctorLocation
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String locationName;

    @Enumerated(EnumType.STRING)
    private ConsultationType consultationType;

    private double consultationFee;

    private Boolean active;

    @OneToOne(cascade = CascadeType.ALL)
    private Address address;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnore
    private Doctor doctor;

    @OneToMany(mappedBy = "doctorLocation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DoctorSchedule> schedules;
}