package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.dto.DoctorScheduleDTO;

import java.util.List;

public interface DoctorScheduleService
{
    DoctorScheduleDTO saveSchedule(int doctorId, int locationId, DoctorScheduleDTO scheduleDTO);

    List<DoctorScheduleDTO> getSchedules(int doctorId, int locationId);

    DoctorScheduleDTO getScheduleById(int doctorId, int locationId, int scheduleId);

    DoctorScheduleDTO updateSchedule(int doctorId, int locationId, int scheduleId, DoctorScheduleDTO scheduleDTO);

    void deleteSchedule(int doctorId, int locationId, int scheduleId);
}