package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.entity.Doctor;
import com.doctorappointment.doctor_service.exception.DoctorNotFoundException;
import com.doctorappointment.doctor_service.repository.DoctorRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class DoctorAuthorizationService
{
    private final DoctorRepository doctorRepository;

    public DoctorAuthorizationService(DoctorRepository doctorRepository)
    {
        this.doctorRepository = doctorRepository;
    }

    public boolean isOwner(int doctorId, Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new DoctorNotFoundException("Doctor Not Found"));

        return doctor.getAuthUserId() == authUserId.intValue();
    }
}
