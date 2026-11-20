package com.doctorappointment.doctor_service.dto;

import com.doctorappointment.doctor_service.entity.ConsultationType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class DoctorLocationDTO
{
    @NotBlank(message = "Location name is required")
    private String locationName;

    @NotNull(message = "Consultation type is required")
    private ConsultationType consultationType;

    @PositiveOrZero(message = "Consultation fee cannot be negative")
    private double consultationFee;

    @NotNull(message = "Active status is required")
    private Boolean active;

    @Valid
    private AddressDTO address;

    private List<DoctorScheduleDTO> schedules;
}