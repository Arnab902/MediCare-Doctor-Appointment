package com.doctorappointment.doctor_service.repository;

import com.doctorappointment.doctor_service.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer>
{
    // =========================
    // Doctor Management
    // =========================

    List<Doctor> findByFullNameContainingIgnoreCase(String fullName);

    List<Doctor> findBySpecializationContainingIgnoreCase(String specialization);


    // =========================
    // Availability
    // =========================

    List<Doctor> findByAvailabilityTrue();

    List<Doctor> findBySpecializationContainingIgnoreCaseAndAvailabilityTrue(String specialization);



    Optional<Doctor> findByAuthUserId(int authUserId);
}