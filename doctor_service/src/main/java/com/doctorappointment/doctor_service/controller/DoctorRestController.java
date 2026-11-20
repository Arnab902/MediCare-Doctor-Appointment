package com.doctorappointment.doctor_service.controller;

import com.doctorappointment.doctor_service.dto.DoctorRequestDTO;
import com.doctorappointment.doctor_service.dto.DoctorUpdateDTO;
import com.doctorappointment.doctor_service.entity.Doctor;
import com.doctorappointment.doctor_service.entity.DoctorLocation;
import com.doctorappointment.doctor_service.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorRestController
{
    private final DoctorService doctorService;

    public DoctorRestController(DoctorService doctorService)
    {
        this.doctorService = doctorService;
    }


    @GetMapping("/doctors/auth-user/{authUserId}")
    @PreAuthorize("hasRole('APPOINTMENT_SERVICE')")
    public Doctor findByAuthUserId(@PathVariable int authUserId)
    {
        return doctorService.findByAuthUserIdServiceImpl(authUserId);
    }


    // Get Logged-in Doctor Profile
    @GetMapping("/doctors/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public Doctor getMyDoctorProfile(Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        return doctorService.findByAuthUserIdServiceImpl(
                authUserId.intValue()
        );
    }


    // =========================
    // A. Doctor Management
    // =========================

    // Create Doctor
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @PostMapping("/doctors/save")
    public Doctor save(
            @Valid @RequestBody DoctorRequestDTO doctorRequestDTO,
            Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        return doctorService.saveDoctorServiceImpl(
                doctorRequestDTO,
                authUserId.intValue()
        );
    }


    // Admin approval of doctor
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/doctors/{doctorId}/approve")
    public Doctor approveDoctor(@PathVariable int doctorId)
    {
        return doctorService.approveDoctor(doctorId);
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/doctors/{doctorId}/reject")
    public Doctor rejectDoctor(@PathVariable int doctorId)
    {
        return doctorService.rejectDoctor(doctorId);
    }


    // Get All Doctors
    @GetMapping("/doctors")
    public List<Doctor> getAllDoctors()
    {
        return doctorService.findAllDoctorServiceImpl();
    }


    // Get Doctor by ID
    @GetMapping("/doctors/{id}")
    public Doctor findDoctorById(@PathVariable int id)
    {
        return doctorService.findByIdDoctorServiceImpl(id);
    }


    // Search Doctor by Name
    @GetMapping("/doctors/name/{fullName}")
    public List<Doctor> findDoctorsByFullName(
            @PathVariable String fullName)
    {
        return doctorService.findDoctorByNameServiceImpl(fullName);
    }


    // Search Doctors by Specialization
    @GetMapping("/doctors/specialization/{specialization}")
    public List<Doctor> findDoctorsBySpecialization(
            @PathVariable String specialization)
    {
        return doctorService
                .findDoctorByspecializationServiceImpl(specialization);
    }


    // Update Doctor
    @PreAuthorize(
            "hasRole('ADMIN') or " +
                    "(hasRole('DOCTOR') and " +
                    "@doctorAuthorizationService.isOwner(#id, authentication))"
    )
    @PatchMapping("/doctors/{id}")
    public Doctor updateDoctorDetails(
            @PathVariable int id,
            @Valid @RequestBody DoctorUpdateDTO doctorUpdateDTO)
    {
        return doctorService.updateDoctorByIdServiceImpl(
                id,
                doctorUpdateDTO
        );
    }


    // Delete Doctor
    @PreAuthorize(
            "hasRole('ADMIN') or " +
                    "(hasRole('DOCTOR') and " +
                    "@doctorAuthorizationService.isOwner(#id, authentication))"
    )
    @DeleteMapping("/doctors/{id}")
    public void deleteDoctorDetails(@PathVariable int id)
    {
        doctorService.deleteByIdDoctorServiceImpl(id);
    }


    // =========================
    // C. Doctor Search & Filtering
    // =========================

    // Find Doctors by Location ID
    @GetMapping("/doctors/location/{locationId}")
    public List<Doctor> findDoctorsByLocation(
            @PathVariable int locationId)
    {
        return doctorService.findAllDoctorsByLocationServiceImpl(
                locationId
        );
    }


    // Find Doctors by City
    @GetMapping("/doctors/city/{city}")
    public List<Doctor> findDoctorsByCity(
            @PathVariable String city)
    {
        return doctorService.findDoctorsByCityServiceImpl(city);
    }


    // Find Doctors by State
    @GetMapping("/doctors/state/{state}")
    public List<Doctor> findDoctorsByState(
            @PathVariable String state)
    {
        return doctorService.findDoctorsByStateServiceImpl(state);
    }


    // Find Doctors by Specialization + City
    @GetMapping(
            "/doctors/search/specialization/{specialization}/city/{city}"
    )
    public List<Doctor> findDoctorsBySpecializationAndCity(
            @PathVariable String specialization,
            @PathVariable String city)
    {
        return doctorService
                .findDoctorsBySpecializationAndCityServiceImpl(
                        specialization,
                        city
                );
    }


    // Find Doctors by Specialization + State
    @GetMapping(
            "/doctors/search/specialization/{specialization}/state/{state}"
    )
    public List<Doctor> findDoctorsBySpecializationAndState(
            @PathVariable String specialization,
            @PathVariable String state)
    {
        return doctorService
                .findDoctorsBySpecializationAndStateServiceImpl(
                        specialization,
                        state
                );
    }


    // Find Doctors by Specialization + Location
    @GetMapping(
            "/doctors/search/specialization/{specialization}/location/{locationId}"
    )
    public List<Doctor> findDoctorsBySpecializationAndLocation(
            @PathVariable String specialization,
            @PathVariable int locationId)
    {
        return doctorService
                .findDoctorsBySpecializationAndLocationServiceImpl(
                        specialization,
                        locationId
                );
    }


    // Find Doctors by Consultation Type
    @GetMapping("/doctors/consultation-type/{consultationType}")
    public List<Doctor> findDoctorsByConsultationType(
            @PathVariable String consultationType)
    {
        return doctorService
                .findDoctorsByConsultationTypeServiceImpl(
                        consultationType
                );
    }


    // Find Doctors by Specialization + Consultation Type
    @GetMapping(
            "/doctors/search/specialization/{specialization}/consultation-type/{consultationType}"
    )
    public List<Doctor> findDoctorsBySpecializationAndConsultationType(
            @PathVariable String specialization,
            @PathVariable String consultationType)
    {
        return doctorService
                .findDoctorsBySpecializationAndConsultationTypeServiceImpl(
                        specialization,
                        consultationType
                );
    }


    // Find Doctors by City + Consultation Type
    @GetMapping(
            "/doctors/search/city/{city}/consultation-type/{consultationType}"
    )
    public List<Doctor> findDoctorsByCityAndConsultationType(
            @PathVariable String city,
            @PathVariable String consultationType)
    {
        return doctorService
                .findDoctorsByCityAndConsultationTypeServiceImpl(
                        city,
                        consultationType
                );
    }


    // Find Doctors by Specialization + City + Consultation Type
    @GetMapping(
            "/doctors/search/specialization/{specialization}/city/{city}/consultation-type/{consultationType}"
    )
    public List<Doctor> findDoctorsBySpecializationAndCityAndConsultationType(
            @PathVariable String specialization,
            @PathVariable String city,
            @PathVariable String consultationType)
    {
        return doctorService
                .findDoctorsBySpecializationAndCityAndConsultationTypeServiceImpl(
                        specialization,
                        city,
                        consultationType
                );
    }


    // =========================
    // D. Availability
    // =========================

    // Get Doctor Availability
    @GetMapping("/doctors/{doctorId}/availability")
    public Boolean getDoctorAvailability(
            @PathVariable int doctorId)
    {
        return doctorService.getDoctorAvailabilityServiceImpl(
                doctorId
        );
    }


    // Update Doctor Availability
    @PreAuthorize(
            "hasRole('ADMIN') or " +
                    "(hasRole('DOCTOR') and " +
                    "@doctorAuthorizationService.isOwner(#doctorId, authentication))"
    )
    @PatchMapping("/doctors/{doctorId}/availability")
    public Doctor updateDoctorAvailability(
            @PathVariable int doctorId,
            @RequestParam Boolean availability)
    {
        return doctorService.updateDoctorAvailabilityServiceImpl(
                doctorId,
                availability
        );
    }


    // Find Available Doctors
    @GetMapping("/doctors/available")
    public List<Doctor> findAvailableDoctors()
    {
        return doctorService.findAvailableDoctorsServiceImpl();
    }


    // Find Available Doctors by Specialization
    @GetMapping("/doctors/available/specialization/{specialization}")
    public List<Doctor> findAvailableDoctorsBySpecialization(
            @PathVariable String specialization)
    {
        return doctorService
                .findAvailableDoctorsBySpecializationServiceImpl(
                        specialization
                );
    }


    // Find Available Doctors by City
    @GetMapping("/doctors/available/city/{city}")
    public List<Doctor> findAvailableDoctorsByCity(
            @PathVariable String city)
    {
        return doctorService
                .findAvailableDoctorsByCityServiceImpl(city);
    }


    // Find Available Doctors by Specialization + City
    @GetMapping(
            "/doctors/available/specialization/{specialization}/city/{city}"
    )
    public List<Doctor> findAvailableDoctorsBySpecializationAndCity(
            @PathVariable String specialization,
            @PathVariable String city)
    {
        return doctorService
                .findAvailableDoctorsBySpecializationAndCityServiceImpl(
                        specialization,
                        city
                );
    }


    // =========================
    // E. Location + Availability
    // =========================

    // Find Available Doctors at Specific Location
    @GetMapping("/doctors/available/location/{locationId}")
    public List<Doctor> findAvailableDoctorsByLocation(
            @PathVariable int locationId)
    {
        return doctorService
                .findAvailableDoctorsByLocationServiceImpl(locationId);
    }


    // Find Available Doctors by City + Specialization
    @GetMapping(
            "/doctors/available/city/{city}/specialization/{specialization}"
    )
    public List<Doctor> findAvailableDoctorsByCityAndSpecialization(
            @PathVariable String city,
            @PathVariable String specialization)
    {
        return doctorService
                .findAvailableDoctorsByCityAndSpecializationServiceImpl(
                        city,
                        specialization
                );
    }


    // Find Available Doctors by City + Specialization + Consultation Type
    @GetMapping(
            "/doctors/available/city/{city}/specialization/{specialization}/consultation-type/{consultationType}"
    )
    public List<Doctor>
    findAvailableDoctorsByCityAndSpecializationAndConsultationType(
            @PathVariable String city,
            @PathVariable String specialization,
            @PathVariable String consultationType)
    {
        return doctorService
                .findAvailableDoctorsByCityAndSpecializationAndConsultationTypeServiceImpl(
                        city,
                        specialization,
                        consultationType
                );
    }


    // =========================
    // F. Doctor Details
    // =========================

    // Get Doctor Details with Locations
    @GetMapping("/doctors/{doctorId}/details")
    public Doctor getDoctorDetailsWithLocations(
            @PathVariable int doctorId)
    {
        return doctorService
                .getDoctorDetailsWithLocationsServiceImpl(doctorId);
    }


    // Get Doctor's Active Locations
    @GetMapping("/doctors/{doctorId}/active-locations")
    public List<DoctorLocation> getDoctorActiveLocations(
            @PathVariable int doctorId)
    {
        return doctorService
                .getDoctorActiveLocationsServiceImpl(doctorId);
    }


    // Get Doctor's Active Consultation Options
    @GetMapping("/doctors/{doctorId}/consultation-options")
    public List<DoctorLocation> getDoctorActiveConsultationOptions(
            @PathVariable int doctorId)
    {
        return doctorService
                .getDoctorActiveConsultationOptionsServiceImpl(doctorId);
    }
}