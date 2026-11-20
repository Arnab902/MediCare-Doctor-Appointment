package com.doctorappointment.patient_service.security;

import com.doctorappointment.patient_service.entity.User;
import com.doctorappointment.patient_service.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientAuthorizationService
{
    private final UserRepository userRepository;

    public PatientAuthorizationService(UserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    public boolean isAdmin(Authentication authentication)
    {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }

    public boolean isOwner(Authentication authentication, int patientId)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        if (authUserId == null)
        {
            return false;
        }

        Optional<User> userOptional = userRepository.findById(patientId);

        if (userOptional.isEmpty())
        {
            return false;
        }

        User patient = userOptional.get();

        return patient.getAuthUserId() == authUserId.intValue();
    }
}
