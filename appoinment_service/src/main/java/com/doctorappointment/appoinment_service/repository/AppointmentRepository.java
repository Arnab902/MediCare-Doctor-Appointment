package com.doctorappointment.appoinment_service.repository;

import com.doctorappointment.appoinment_service.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer>
{
    // Find appointments by Patient ID
    public List<Appointment> findByPatientId(int patientId);

    // Find appointments by Doctor ID
    public List<Appointment> findByDoctorId(int doctorId);

    // Check for double-booking conflict while creating
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(int doctorId, LocalDate appointmentDate, LocalTime appointmentTime);

    // Check for double-booking conflict while updating
    // Excludes the current appointment ID
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndIdNot(int doctorId, LocalDate appointmentDate, LocalTime appointmentTime, int id);

    List<Appointment> findByPatientIdIn(List<Integer> patientIds);
}
