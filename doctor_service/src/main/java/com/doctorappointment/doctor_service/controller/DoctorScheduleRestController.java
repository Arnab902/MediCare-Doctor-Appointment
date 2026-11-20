package com.doctorappointment.doctor_service.controller;

import com.doctorappointment.doctor_service.dto.DoctorScheduleDTO;
import com.doctorappointment.doctor_service.service.DoctorScheduleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors/{doctorId}/locations/{locationId}/schedules")
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorScheduleRestController
{
    private final DoctorScheduleService doctorScheduleService;

    public DoctorScheduleRestController(
            DoctorScheduleService doctorScheduleService)
    {
        this.doctorScheduleService =
                doctorScheduleService;
    }


    // =========================
    // Add Schedule
    // =========================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    public ResponseEntity<DoctorScheduleDTO> saveSchedule(
            @PathVariable int doctorId,
            @PathVariable int locationId,
            @RequestBody DoctorScheduleDTO scheduleDTO)
    {
        DoctorScheduleDTO savedSchedule =
                doctorScheduleService.saveSchedule(
                        doctorId,
                        locationId,
                        scheduleDTO);

        return new ResponseEntity<>(
                savedSchedule,
                HttpStatus.CREATED);
    }


    // =========================
    // Get All Schedules
    // =========================

    @GetMapping
    public ResponseEntity<List<DoctorScheduleDTO>> getSchedules(
            @PathVariable int doctorId,
            @PathVariable int locationId)
    {
        List<DoctorScheduleDTO> schedules =
                doctorScheduleService.getSchedules(
                        doctorId,
                        locationId);

        return ResponseEntity.ok(schedules);
    }


    // =========================
    // Get Schedule By ID
    // =========================

    @GetMapping("/{scheduleId}")
    public ResponseEntity<DoctorScheduleDTO> getScheduleById(
            @PathVariable int doctorId,
            @PathVariable int locationId,
            @PathVariable int scheduleId)
    {
        DoctorScheduleDTO schedule =
                doctorScheduleService.getScheduleById(
                        doctorId,
                        locationId,
                        scheduleId);

        return ResponseEntity.ok(schedule);
    }


    // =========================
    // Update Schedule
    // =========================

    @PutMapping("/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    public ResponseEntity<DoctorScheduleDTO> updateSchedule(
            @PathVariable int doctorId,
            @PathVariable int locationId,
            @PathVariable int scheduleId,
            @RequestBody DoctorScheduleDTO scheduleDTO)
    {
        DoctorScheduleDTO updatedSchedule =
                doctorScheduleService.updateSchedule(
                        doctorId,
                        locationId,
                        scheduleId,
                        scheduleDTO);

        return ResponseEntity.ok(updatedSchedule);
    }


    // =========================
    // Delete Schedule
    // =========================

    @DeleteMapping("/{scheduleId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('DOCTOR') and @doctorAuthorizationService.isOwner(#doctorId, authentication))")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable int doctorId,
            @PathVariable int locationId,
            @PathVariable int scheduleId)
    {
        doctorScheduleService.deleteSchedule(
                doctorId,
                locationId,
                scheduleId);

        return ResponseEntity.noContent().build();
    }
}