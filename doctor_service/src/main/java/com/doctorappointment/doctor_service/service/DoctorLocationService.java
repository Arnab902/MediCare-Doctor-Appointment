package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.dto.DoctorLocationDTO;
import com.doctorappointment.doctor_service.entity.DoctorLocation;

import java.util.List;

public interface DoctorLocationService
{
    // =========================
    // B. Doctor Location Management
    // =========================

    // Add Location to Doctor
    DoctorLocation saveDoctorLocationServiceImpl(int doctorId, DoctorLocationDTO doctorLocationDTO);

    // Get All Locations of a Doctor
    List<DoctorLocation> findAllDoctorLocationsServiceImpl(int doctorId);

    // Get Specific Location of a Doctor
    DoctorLocation findDoctorLocationByIdServiceImpl(int doctorId, int locationId);

    // Update Doctor Location
    DoctorLocation updateDoctorLocationServiceImpl(int doctorId, int locationId, DoctorLocationDTO doctorLocationDTO);

    // Delete Doctor Location
    void deleteDoctorLocationServiceImpl(int doctorId, int locationId);

    // Activate Doctor Location
    DoctorLocation activateDoctorLocationServiceImpl(int doctorId, int locationId);

    // Deactivate Doctor Location
    DoctorLocation deactivateDoctorLocationServiceImpl(int doctorId, int locationId);
}