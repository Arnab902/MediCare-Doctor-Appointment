package com.doctorappointment.appoinment_service.client;

import com.doctorappointment.appoinment_service.dto.DoctorLocationResponseDTO;
import com.doctorappointment.appoinment_service.dto.DoctorResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "doctor-service",url = "http://localhost:8082")
public interface DoctorClient
{
    @GetMapping("/doctors/{id}")
    DoctorResponseDTO getDoctorById(@PathVariable int id);

    @GetMapping("/doctors/{doctorId}/locations/{locationId}")
    DoctorLocationResponseDTO getDoctorLocationById(@PathVariable int doctorId, @PathVariable int locationId);

    @GetMapping("/doctors/auth-user/{authUserId}")
    DoctorResponseDTO getDoctorByAuthUserId(@PathVariable int authUserId);
}
