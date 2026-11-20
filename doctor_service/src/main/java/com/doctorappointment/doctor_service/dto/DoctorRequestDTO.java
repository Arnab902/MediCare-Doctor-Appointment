package com.doctorappointment.doctor_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DoctorRequestDTO
{
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Enter a valid 10-digit phone number"
    )
    private String phoneNumber;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotBlank(message = "Qualification is required")
    private String qualification;

    @Min(value = 0, message = "Experience cannot be negative")
    private int exp;

    @NotBlank(message = "Language is required")
    private String language;

    private String profileImage;

    @NotNull(message = "Availability is required")
    private Boolean availability;

    @Valid
    private List<DoctorLocationDTO> locations;
}