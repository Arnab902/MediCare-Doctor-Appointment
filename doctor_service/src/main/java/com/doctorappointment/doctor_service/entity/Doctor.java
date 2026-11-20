package com.doctorappointment.doctor_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "doctors")
@Getter
@Setter
public class Doctor
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int authUserId;

    private String fullName;

    private String email;

    private String phoneNumber;

    private String specialization;

    private String qualification;

    private int exp;

    private String language;

    private String profileImage;

    private Boolean availability;

    @Enumerated(EnumType.STRING)
    private DoctorProfileStatus profileStatus;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("doctor")
    private List<DoctorLocation> locations;
}