package com.doctorappointment.doctor_service.repository;

import com.doctorappointment.doctor_service.entity.DoctorLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorLocationRepository extends JpaRepository<DoctorLocation, Integer>
{
    // =========================
    // Doctor Location Management
    // =========================

    List<DoctorLocation> findByDoctorId(int doctorId);

    Optional<DoctorLocation> findByIdAndDoctorId(int locationId, int doctorId);


    // =========================
    // Location Search
    // =========================

    List<DoctorLocation> findByAddressCityIgnoreCase(String city);

    List<DoctorLocation> findByAddressStateIgnoreCase(String state);

    List<DoctorLocation> findByLocationNameContainingIgnoreCase(String locationName);


    // =========================
    // Consultation Type
    // =========================

    List<DoctorLocation> findByConsultationType(com.doctorappointment.doctor_service.entity.ConsultationType consultationType);


    // =========================
    // Active Locations
    // =========================

    List<DoctorLocation> findByDoctorIdAndActiveTrue(int doctorId);

    List<DoctorLocation> findByDoctorIdAndActiveTrueAndConsultationType(int doctorId, com.doctorappointment.doctor_service.entity.ConsultationType consultationType);


    // =========================
    // Location + Consultation
    // =========================

    List<DoctorLocation> findByAddressCityIgnoreCaseAndConsultationType(String city, com.doctorappointment.doctor_service.entity.ConsultationType consultationType);

    List<DoctorLocation> findByAddressStateIgnoreCaseAndConsultationType(String state, com.doctorappointment.doctor_service.entity.ConsultationType consultationType);


    // =========================
    // Active Location Search
    // =========================

    List<DoctorLocation> findByAddressCityIgnoreCaseAndActiveTrue(String city);

    List<DoctorLocation> findByAddressStateIgnoreCaseAndActiveTrue(String state);

    List<DoctorLocation> findByActiveTrue();
}