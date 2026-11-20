package com.doctorappointment.patient_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "patients")
@Getter
@Setter
public class User
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // ID of the user from Auth Service
    @Column(name = "auth_user_id")
    private int authUserId;

    // Relationship with the logged-in account owner
    // SELF, MOTHER, FATHER, SPOUSE, CHILD, OTHER
    @Column(name = "relationship")
    private String relationship;

    private String fullName;
    private String email;
    private String phone;

    private String address;
    private String city;
    private String state;
    private String pincode;
}