package com.doctorappointment.appoinment_service.client;

import com.doctorappointment.appoinment_service.dto.PatientResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "patient-service", url = "http://localhost:8081")
public interface PatientClient
{
    @GetMapping("/patients/internal/{patientId}")
    PatientResponseDTO getPatientById(@PathVariable int patientId);

    @GetMapping("/patients/auth-user/{authUserId}")
    PatientResponseDTO getPatientByAuthUserId(@PathVariable int authUserId);

    @GetMapping("/patients/auth-user/{authUserId}/all")
    List<PatientResponseDTO> getPatientsByAuthUserId(@PathVariable int authUserId);

    @GetMapping("/patients/{patientId}/belongs-to/{authUserId}")
    boolean isPatientBelongsToAuthUser(@PathVariable int patientId, @PathVariable int authUserId);
}