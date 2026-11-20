package com.doctorappointment.appoinment_service.security;

import com.doctorappointment.appoinment_service.client.DoctorClient;
import com.doctorappointment.appoinment_service.client.PatientClient;
import com.doctorappointment.appoinment_service.dto.PatientResponseDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentAuthorizationService
{
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

    public AppointmentAuthorizationService(
            PatientClient patientClient,
            DoctorClient doctorClient)
    {
        this.patientClient = patientClient;
        this.doctorClient = doctorClient;
    }

    public boolean isPatient(Authentication authentication)
    {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_PATIENT"));
    }

    public boolean isDoctor(Authentication authentication)
    {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_DOCTOR"));
    }

    public boolean isAdmin(Authentication authentication)
    {
        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }

    public Long getAuthUserId(Authentication authentication)
    {
        if (!(authentication instanceof JwtAuthenticationToken jwtAuthenticationToken))
        {
            return null;
        }

        return jwtAuthenticationToken.getToken().getClaim("userId");
    }

    /*
     * Gets the SELF patient profile of the logged-in user.
     *
     * This method is still useful for operations where
     * the logged-in user's own patient profile is required.
     */
    public int getPatientId(Authentication authentication)
    {
        Long authUserId = getAuthUserId(authentication);

        if (authUserId == null)
        {
            throw new IllegalStateException("Auth user ID not found");
        }

        return patientClient
                .getPatientByAuthUserId(authUserId.intValue())
                .getId();
    }

    /*
     * Checks whether the selected patient profile belongs
     * to the currently logged-in account.
     *
     * This is required because one Auth User can now have
     * multiple patient profiles.
     *
     * Example:
     *
     * Auth User 11
     *     ├── Patient 1 -> SELF
     *     ├── Patient 4 -> GRANDMOTHER
     *     └── Patient 5 -> CHILD
     *
     * Patient 4 is allowed if the JWT belongs to Auth User 11.
     */
    public boolean isPatientOwner(
            Authentication authentication,
            int patientId)
    {
        Long authUserId = getAuthUserId(authentication);

        if (authUserId == null)
        {
            return false;
        }

        try
        {
            return patientClient.isPatientBelongsToAuthUser(
                    patientId,
                    authUserId.intValue()
            );
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public int getDoctorId(Authentication authentication)
    {
        Long authUserId = getAuthUserId(authentication);

        System.out.println("========== DOCTOR AUTH DEBUG ==========");
        System.out.println("Auth User ID from JWT = " + authUserId);

        if (authUserId == null)
        {
            throw new IllegalStateException("Auth user ID not found");
        }

        int doctorId = doctorClient
                .getDoctorByAuthUserId(authUserId.intValue())
                .getId();

        System.out.println("Doctor ID returned from Doctor Service = " + doctorId
        );

        System.out.println("=======================================");

        return doctorId;
    }

    public List<Integer> getPatientIds(Authentication authentication)
    {
        Long authUserId = getAuthUserId(authentication);

        if (authUserId == null)
        {
            throw new IllegalStateException("Auth user ID not found");
        }

        return patientClient
                .getPatientsByAuthUserId(authUserId.intValue())
                .stream()
                .map(PatientResponseDTO::getId)
                .toList();
    }
}