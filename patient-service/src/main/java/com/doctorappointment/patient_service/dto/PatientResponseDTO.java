package com.doctorappointment.patient_service.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PatientResponseDTO {

    private int id;

    private int authUserId;

    private String relationship;

    private String fullName;
    private String email;
    private String phone;

    private String address;
    private String city;
    private String state;
    private String pincode;
}