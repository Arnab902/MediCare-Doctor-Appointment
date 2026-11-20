package com.doctorappointment.doctor_service.repository;

import com.doctorappointment.doctor_service.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Integer>
{
    List<DoctorSchedule> findByDoctorLocationId(int doctorLocationId);
}