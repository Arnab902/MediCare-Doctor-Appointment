package com.doctorappointment.patient_service.controller;

import com.doctorappointment.patient_service.dto.FamilyPatientRequestDTO;
import com.doctorappointment.patient_service.dto.PatientPatchDTO;
import com.doctorappointment.patient_service.dto.PatientRequestDTO;
import com.doctorappointment.patient_service.dto.PatientResponseDTO;
import com.doctorappointment.patient_service.security.PatientAuthorizationService;
import com.doctorappointment.patient_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class UserRestController
{
    @Autowired
    private UserService userService;

    @Autowired
    private PatientAuthorizationService patientAuthorizationService;


    // Calling patient details by Auth Service userId
    @GetMapping("/patients/auth-user/{authUserId}")
    @PreAuthorize("hasRole('APPOINTMENT_SERVICE')")
    public PatientResponseDTO findByAuthUserId(
            @PathVariable int authUserId)
    {
        return userService.findByAuthUserIdService(authUserId);
    }


    // Check whether a patient profile belongs to an auth user
    // This endpoint is used internally by Appointment Service
    @GetMapping("/patients/{patientId}/belongs-to/{authUserId}")
    @PreAuthorize("hasRole('APPOINTMENT_SERVICE')")
    public boolean isPatientBelongsToAuthUser(
            @PathVariable int patientId,
            @PathVariable int authUserId)
    {
        return userService.isPatientBelongsToAuthUserService(
                patientId,
                authUserId
        );
    }


    // Calling currently logged-in patient's details
    @GetMapping("/patients/me")
    public PatientResponseDTO findMyProfile(
            Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        if (authUserId == null)
        {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User ID not found in token"
            );
        }

        return userService.findByAuthUserIdService(
                authUserId.intValue()
        );
    }


    // Calling save API
    @PostMapping("/save")
    public PatientResponseDTO save(
            @Valid @RequestBody PatientRequestDTO patientRequestDTO,
            Authentication authentication)
    {
        return userService.saveUserService(
                patientRequestDTO,
                authentication
        );
    }

    @PostMapping("/patients/family")
    public PatientResponseDTO saveFamilyPatient(
            @Valid @RequestBody FamilyPatientRequestDTO familyPatientRequestDTO,
            Authentication authentication)
    {
        return userService.saveFamilyPatientService(
                familyPatientRequestDTO,
                authentication
        );
    }


    // Calling Get all patients details API
    @GetMapping("/patients")
    public List<PatientResponseDTO> findAll(
            Authentication authentication)
    {
        if (!patientAuthorizationService.isAdmin(authentication))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admin can access all patient profiles"
            );
        }

        return userService.findAllPatientService();
    }


    // Calling Get patients details by specific id API
    @GetMapping("/patients/{id}")
    public PatientResponseDTO findOne(
            @PathVariable Integer id,
            Authentication authentication)
    {
        if (!patientAuthorizationService.isAdmin(authentication)
                && !patientAuthorizationService.isOwner(authentication, id))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only access your own profile"
            );
        }

        return userService.findByIdPatientService(id);
    }


    @GetMapping("/patients/my-profiles")
    public List<PatientResponseDTO> findMyProfiles(
            Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        if (authUserId == null)
        {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User ID not found in token"
            );
        }

        return userService.findMyProfilesService(
                authUserId.intValue()
        );
    }


    // Calling Get patients details by specific name API
    @GetMapping("/patients/name/{fullName}")
    public List<PatientResponseDTO> fetchPatientByName(
            @PathVariable String fullName,
            Authentication authentication)
    {
        if (!patientAuthorizationService.isAdmin(authentication))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admin can search patient profiles"
            );
        }

        return userService.fetchPatientByNameService(fullName);
    }


    // Calling update patients details by id API
    @PutMapping("/patients/{id}")
    public PatientResponseDTO updatePatient(
            @PathVariable Integer id,
            @Valid @RequestBody PatientRequestDTO patientRequestDTO,
            Authentication authentication)
    {
        if (!patientAuthorizationService.isAdmin(authentication)
                && !patientAuthorizationService.isOwner(authentication, id))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only update your own profile"
            );
        }

        return userService.updatePatientByIdService(
                id,
                patientRequestDTO
        );
    }


    // Calling patch patients details by id API
    @PatchMapping("/patients/{id}")
    public PatientResponseDTO patchPatient(
            @PathVariable Integer id,
            @Valid @RequestBody PatientPatchDTO patientPatchDTO,
            Authentication authentication)
    {
        if (!patientAuthorizationService.isAdmin(authentication)
                && !patientAuthorizationService.isOwner(authentication, id))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only update your own profile"
            );
        }

        return userService.patchPatientByIdService(
                id,
                patientPatchDTO
        );
    }


    // Calling delete patients details by id API
    @DeleteMapping("/patients/{id}")
    public void deletePatient(
            @PathVariable Integer id,
            Authentication authentication)
    {
        if (!patientAuthorizationService.isAdmin(authentication))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admin can delete a patient"
            );
        }

        userService.deleteByIdPatientService(id);
    }

    @GetMapping("/patients/auth-user/{authUserId}/all")
    @PreAuthorize("hasRole('APPOINTMENT_SERVICE')")
    public List<PatientResponseDTO> findAllByAuthUserId(@PathVariable int authUserId)
    {
        return userService.findMyProfilesService(authUserId);
    }


    @GetMapping("/patients/internal/{patientId}")
    @PreAuthorize("hasRole('APPOINTMENT_SERVICE')")
    public PatientResponseDTO findPatientForAppointmentService(@PathVariable int patientId)
    {
        return userService.findByIdPatientService(patientId);
    }
}
