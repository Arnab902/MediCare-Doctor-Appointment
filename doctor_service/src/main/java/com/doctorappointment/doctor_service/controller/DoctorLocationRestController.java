package com.doctorappointment.doctor_service.controller;

import com.doctorappointment.doctor_service.dto.DoctorLocationDTO;
import com.doctorappointment.doctor_service.entity.DoctorLocation;
import com.doctorappointment.doctor_service.service.DoctorLocationService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorLocationRestController
{
    private final DoctorLocationService doctorLocationService;

    public DoctorLocationRestController(
            DoctorLocationService doctorLocationService)
    {
        this.doctorLocationService = doctorLocationService;
    }


    // =========================
    // B. Doctor Location Management
    // =========================

    // Add Location to Doctor
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    @PostMapping("/doctors/{doctorId}/locations")
    public DoctorLocation saveDoctorLocation(@PathVariable int doctorId, @Valid @RequestBody DoctorLocationDTO doctorLocationDTO)
    {
        return doctorLocationService.saveDoctorLocationServiceImpl(doctorId, doctorLocationDTO);
    }


    // Get All Locations of a Doctor
    @GetMapping("/doctors/{doctorId}/locations")
    public List<DoctorLocation> findAllDoctorLocations(@PathVariable int doctorId)
    {
        return doctorLocationService.findAllDoctorLocationsServiceImpl(doctorId);
    }


    // Get Specific Location of a Doctor
    @GetMapping("/doctors/{doctorId}/locations/{locationId}")
    public DoctorLocation findDoctorLocationById(@PathVariable int doctorId, @PathVariable int locationId)
    {
        return doctorLocationService.findDoctorLocationByIdServiceImpl(doctorId, locationId);
    }


    // Update Doctor Location
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    @PutMapping("/doctors/{doctorId}/locations/{locationId}")
    public DoctorLocation updateDoctorLocation(@PathVariable int doctorId, @PathVariable int locationId, @Valid @RequestBody DoctorLocationDTO doctorLocationDTO)
    {
        return doctorLocationService.updateDoctorLocationServiceImpl(doctorId, locationId, doctorLocationDTO);
    }


    // Delete Doctor Location
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    @DeleteMapping("/doctors/{doctorId}/locations/{locationId}")
    public void deleteDoctorLocation(@PathVariable int doctorId, @PathVariable int locationId)
    {
        doctorLocationService.deleteDoctorLocationServiceImpl(doctorId, locationId);
    }


    // Activate Doctor Location
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    @PatchMapping("/doctors/{doctorId}/locations/{locationId}/activate")
    public DoctorLocation activateDoctorLocation(@PathVariable int doctorId, @PathVariable int locationId)
    {
        return doctorLocationService.activateDoctorLocationServiceImpl(doctorId, locationId);
    }


    // Deactivate Doctor Location
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    @PatchMapping("/doctors/{doctorId}/locations/{locationId}/deactivate")
    public DoctorLocation deactivateDoctorLocation(@PathVariable int doctorId, @PathVariable int locationId)
    {
        return doctorLocationService.deactivateDoctorLocationServiceImpl(doctorId, locationId);
    }
}