package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.dto.DoctorRequestDTO;
import com.doctorappointment.doctor_service.dto.DoctorUpdateDTO;
import com.doctorappointment.doctor_service.entity.Doctor;

import java.util.List;

public interface DoctorService
{

    // Get Doctor by Auth Service user ID
    Doctor findByAuthUserIdServiceImpl(int authUserId);


    // =========================
    // A. Doctor Management
    // =========================

    // Create Doctor
    Doctor saveDoctorServiceImpl(DoctorRequestDTO doctor, int authUserId);

    Doctor approveDoctor(int doctorId);

    Doctor rejectDoctor(int doctorId);

    // Get All Doctors
    List<Doctor> findAllDoctorServiceImpl();

    // Get Doctor by ID
    Doctor findByIdDoctorServiceImpl(int id);

    // Update Doctor
    Doctor updateDoctorByIdServiceImpl(int id, DoctorUpdateDTO doctor);

    // Delete Doctor
    void deleteByIdDoctorServiceImpl(int id);

    // Search Doctor by Name
    List<Doctor> findDoctorByNameServiceImpl(String fullName);

    // Search Doctors by Specialization
    List<Doctor> findDoctorByspecializationServiceImpl(String specialization);

    // Find all doctors by location
    List<Doctor> findAllDoctorsByLocationServiceImpl(int locationId);


    // =========================
    // C. Doctor Search & Filtering
    // =========================

    // Search Doctors by City
    List<Doctor> findDoctorsByCityServiceImpl(String city);

    // Search Doctors by State
    List<Doctor> findDoctorsByStateServiceImpl(String state);

    // Search Doctors by Specialization + City
    List<Doctor> findDoctorsBySpecializationAndCityServiceImpl(String specialization, String city);

    // Search Doctors by Specialization + State
    List<Doctor> findDoctorsBySpecializationAndStateServiceImpl(String specialization, String state);

    // Search Doctors by Specialization + Location
    List<Doctor> findDoctorsBySpecializationAndLocationServiceImpl(String specialization, int locationId);

    // Search Doctors by Consultation Type
    List<Doctor> findDoctorsByConsultationTypeServiceImpl(String consultationType);

    // Search Doctors by Specialization + Consultation Type
    List<Doctor> findDoctorsBySpecializationAndConsultationTypeServiceImpl(String specialization, String consultationType);

    // Search Doctors by City + Consultation Type
    List<Doctor> findDoctorsByCityAndConsultationTypeServiceImpl(String city, String consultationType);

    // Search Doctors by Specialization + City + Consultation Type
    List<Doctor> findDoctorsBySpecializationAndCityAndConsultationTypeServiceImpl(String specialization, String city, String consultationType);


    // =========================
    // D. Availability
    // =========================

    // Get Doctor Availability
    Boolean getDoctorAvailabilityServiceImpl(int doctorId);

    // Update Doctor Availability
    Doctor updateDoctorAvailabilityServiceImpl(int doctorId, Boolean availability);

    // Find Available Doctors
    List<Doctor> findAvailableDoctorsServiceImpl();

    // Find Available Doctors by Specialization
    List<Doctor> findAvailableDoctorsBySpecializationServiceImpl(String specialization);

    // Find Available Doctors by City
    List<Doctor> findAvailableDoctorsByCityServiceImpl(String city);

    // Find Available Doctors by Specialization + City
    List<Doctor> findAvailableDoctorsBySpecializationAndCityServiceImpl(String specialization, String city);


    // =========================
    // E. Location + Availability
    // =========================

    // Find Available Doctors at a Specific Location
    List<Doctor> findAvailableDoctorsByLocationServiceImpl(int locationId);

    // Find Available Doctors by City + Specialization
    List<Doctor> findAvailableDoctorsByCityAndSpecializationServiceImpl(String city, String specialization);

    // Find Available Doctors by City + Specialization + Consultation Type
    List<Doctor> findAvailableDoctorsByCityAndSpecializationAndConsultationTypeServiceImpl(String city, String specialization, String consultationType);


    // =========================
    // F. Doctor Details for Appointment
    // =========================

    // Get Doctor Details with Locations
    Doctor getDoctorDetailsWithLocationsServiceImpl(int doctorId);

    // Get Doctor's Active Locations
    List<com.doctorappointment.doctor_service.entity.DoctorLocation>
    getDoctorActiveLocationsServiceImpl(int doctorId);

    // Get Doctor's Active Consultation Options
    List<com.doctorappointment.doctor_service.entity.DoctorLocation>
    getDoctorActiveConsultationOptionsServiceImpl(int doctorId);
}