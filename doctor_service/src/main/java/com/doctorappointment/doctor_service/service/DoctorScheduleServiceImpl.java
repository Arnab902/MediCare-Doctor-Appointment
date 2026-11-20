package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.dto.DoctorScheduleDTO;
import com.doctorappointment.doctor_service.entity.DoctorLocation;
import com.doctorappointment.doctor_service.entity.DoctorSchedule;
import com.doctorappointment.doctor_service.exception.DoctorNotFoundException;
import com.doctorappointment.doctor_service.repository.DoctorLocationRepository;
import com.doctorappointment.doctor_service.repository.DoctorScheduleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorScheduleServiceImpl implements DoctorScheduleService
{
    private final DoctorLocationRepository doctorLocationRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;

    public DoctorScheduleServiceImpl(
            DoctorLocationRepository doctorLocationRepository,
            DoctorScheduleRepository doctorScheduleRepository)
    {
        this.doctorLocationRepository = doctorLocationRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
    }


    // =========================
    // A. Save Schedule
    // =========================

    @Override
    public DoctorScheduleDTO saveSchedule(
            int doctorId,
            int locationId,
            DoctorScheduleDTO scheduleDTO)
    {
        DoctorLocation location =
                findDoctorLocation(
                        doctorId,
                        locationId);

        validateSchedule(scheduleDTO);

        DoctorSchedule schedule =
                new DoctorSchedule();

        schedule.setDayOfWeek(
                scheduleDTO.getDayOfWeek());

        schedule.setStartTime(
                scheduleDTO.getStartTime());

        schedule.setEndTime(
                scheduleDTO.getEndTime());

        schedule.setDoctorLocation(location);

        DoctorSchedule savedSchedule =
                doctorScheduleRepository.save(schedule);

        return convertToDTO(savedSchedule);
    }


    // =========================
    // B. Get All Schedules
    // =========================

    @Override
    public List<DoctorScheduleDTO> getSchedules(
            int doctorId,
            int locationId)
    {
        findDoctorLocation(
                doctorId,
                locationId);

        List<DoctorSchedule> schedules =
                doctorScheduleRepository
                        .findByDoctorLocationId(locationId);

        return schedules.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    // =========================
    // C. Get Schedule By ID
    // =========================

    @Override
    public DoctorScheduleDTO getScheduleById(
            int doctorId,
            int locationId,
            int scheduleId)
    {
        findDoctorLocation(
                doctorId,
                locationId);

        Optional<DoctorSchedule> scheduleOptional =
                doctorScheduleRepository.findById(scheduleId);

        if (scheduleOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Schedule Not Found");
        }

        DoctorSchedule schedule =
                scheduleOptional.get();

        if (schedule.getDoctorLocation().getId()
                != locationId)
        {
            throw new DoctorNotFoundException(
                    "Doctor Schedule Not Found");
        }

        return convertToDTO(schedule);
    }


    // =========================
    // D. Update Schedule
    // =========================

    @Override
    public DoctorScheduleDTO updateSchedule(
            int doctorId,
            int locationId,
            int scheduleId,
            DoctorScheduleDTO scheduleDTO)
    {
        DoctorLocation location =
                findDoctorLocation(
                        doctorId,
                        locationId);

        validateSchedule(scheduleDTO);

        Optional<DoctorSchedule> scheduleOptional =
                doctorScheduleRepository.findById(scheduleId);

        if (scheduleOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Schedule Not Found");
        }

        DoctorSchedule schedule =
                scheduleOptional.get();

        if (schedule.getDoctorLocation().getId()
                != location.getId())
        {
            throw new DoctorNotFoundException(
                    "Doctor Schedule Not Found");
        }

        schedule.setDayOfWeek(
                scheduleDTO.getDayOfWeek());

        schedule.setStartTime(
                scheduleDTO.getStartTime());

        schedule.setEndTime(
                scheduleDTO.getEndTime());

        DoctorSchedule updatedSchedule =
                doctorScheduleRepository.save(schedule);

        return convertToDTO(updatedSchedule);
    }


    // =========================
    // E. Delete Schedule
    // =========================

    @Override
    public void deleteSchedule(
            int doctorId,
            int locationId,
            int scheduleId)
    {
        findDoctorLocation(
                doctorId,
                locationId);

        Optional<DoctorSchedule> scheduleOptional =
                doctorScheduleRepository.findById(scheduleId);

        if (scheduleOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Schedule Not Found");
        }

        DoctorSchedule schedule =
                scheduleOptional.get();

        if (schedule.getDoctorLocation().getId()
                != locationId)
        {
            throw new DoctorNotFoundException(
                    "Doctor Schedule Not Found");
        }

        doctorScheduleRepository.delete(schedule);
    }


    // =========================
    // Helper Methods
    // =========================

    private DoctorLocation findDoctorLocation(
            int doctorId,
            int locationId)
    {
        Optional<DoctorLocation> locationOptional =
                doctorLocationRepository
                        .findByIdAndDoctorId(
                                locationId,
                                doctorId);

        if (locationOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Location Not Found");
        }

        return locationOptional.get();
    }


    private void validateSchedule(
            DoctorScheduleDTO dto)
    {
        if (dto.getDayOfWeek() == null)
        {
            throw new IllegalArgumentException(
                    "Day of week is required");
        }

        if (dto.getStartTime() == null)
        {
            throw new IllegalArgumentException(
                    "Start time is required");
        }

        if (dto.getEndTime() == null)
        {
            throw new IllegalArgumentException(
                    "End time is required");
        }

        if (!dto.getStartTime().isBefore(
                dto.getEndTime()))
        {
            throw new IllegalArgumentException(
                    "Start time must be before end time");
        }
    }


    private DoctorScheduleDTO convertToDTO(
            DoctorSchedule schedule)
    {
        DoctorScheduleDTO dto =
                new DoctorScheduleDTO();

        dto.setId(schedule.getId());

        dto.setDayOfWeek(
                schedule.getDayOfWeek());

        dto.setStartTime(
                schedule.getStartTime());

        dto.setEndTime(
                schedule.getEndTime());

        return dto;
    }
}