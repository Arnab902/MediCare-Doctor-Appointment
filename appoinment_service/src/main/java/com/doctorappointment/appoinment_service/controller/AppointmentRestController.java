package com.doctorappointment.appoinment_service.controller;

import com.doctorappointment.appoinment_service.dto.AppointmentDTO;
import com.doctorappointment.appoinment_service.dto.AppointmentResponseDTO;
import com.doctorappointment.appoinment_service.dto.AppointmentUpdateDTO;
import com.doctorappointment.appoinment_service.dto.RescheduleAppointmentDTO;
import com.doctorappointment.appoinment_service.entity.Appointment;
import com.doctorappointment.appoinment_service.security.AppointmentAuthorizationService;
import com.doctorappointment.appoinment_service.service.AppointmentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentRestController
{
    private final AppointmentService appointmentService;
    private final AppointmentAuthorizationService authorizationService;

    public AppointmentRestController(
            AppointmentService appointmentService,
            AppointmentAuthorizationService authorizationService)
    {
        this.appointmentService = appointmentService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/appointments/save")
    public Appointment saveAppointment(
            @Valid @RequestBody AppointmentDTO appointmentDTO,
            Authentication authentication)
    {
        return appointmentService.createAppointmentServiceImpl(
                appointmentDTO,
                authentication
        );
    }

    /*
     * Get one appointment by ID.
     *
     * PATIENT  -> only their own appointment
     * DOCTOR   -> only their own doctor's appointment
     * ADMIN    -> any appointment
     */
    @GetMapping("/appointments/findId/{id}")
    public AppointmentResponseDTO findAppointmentById(
            @PathVariable int id,
            Authentication authentication)
    {
        return appointmentService.getAppointmentByIdServiceImpl(
                id,
                authentication
        );
    }

    /*
     * Only ADMIN can view all appointments.
     */
    @GetMapping("/appointments/findAll")
    public List<AppointmentResponseDTO> findAllAppointment(
            Authentication authentication)
    {
        if (!authorizationService.isAdmin(authentication))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only ADMIN can view all appointments"
            );
        }

        return appointmentService.getAllAppointmentServiceImpl();
    }

    /*
     * PATIENT can view only their own appointments.
     */
    @GetMapping("/appointments/my")
    public List<AppointmentResponseDTO> findMyAppointments(
            Authentication authentication)
    {
        if (!authorizationService.isPatient(authentication))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only PATIENT can access this endpoint"
            );
        }

        List<Integer> patientIds =
                authorizationService.getPatientIds(authentication);

        return appointmentService.getAppointmentsByPatientIdsServiceImpl(
                patientIds
        );
    }

    /*
     * DOCTOR can view only appointments belonging to them.
     */
    @GetMapping("/appointments/doctor/my")
    public List<AppointmentResponseDTO> findMyDoctorAppointments(
            Authentication authentication)
    {
        if (!authorizationService.isDoctor(authentication))
        {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only DOCTOR can access this endpoint"
            );
        }

        int doctorId =
                authorizationService.getDoctorId(authentication);

        return appointmentService.getAppointmentsByDoctorIdServiceImpl(
                doctorId
        );
    }

    /*
     * Update appointment.
     *
     * PATIENT -> can update only their own appointment
     * DOCTOR  -> can update appointments belonging to them
     * ADMIN   -> can update any appointment
     *
     * Only BOOKED appointments can be updated.
     */
    @PutMapping("/appointments/update/{id}")
    public Appointment updateAppointment(
            @PathVariable int id,
            @RequestBody AppointmentUpdateDTO appointmentUpdateDTO,
            Authentication authentication)
    {
        return appointmentService.updateAppointmentServiceImpl(
                id,
                appointmentUpdateDTO,
                authentication
        );
    }

    /*
     * Complete appointment.
     *
     * DOCTOR -> can complete only their own doctor's appointments
     * ADMIN  -> can complete any appointment
     * PATIENT -> not allowed
     */
    @PatchMapping("/appointments/complete/{id}")
    public Appointment completeAppointment(
            @PathVariable int id,
            Authentication authentication)
    {
        return appointmentService.completeAppointmentServiceImpl(
                id,
                authentication
        );
    }

    @PatchMapping("/appointments/cancel/{id}")
    public Appointment cancelAppointment(
            @PathVariable int id,
            Authentication authentication)
    {
        return appointmentService.cancelAppointmentServiceImpl(
                id,
                authentication
        );
    }

    @PatchMapping("/appointments/reschedule/{id}")
    public Appointment requestReschedule(
            @PathVariable int id,
            @Valid @RequestBody RescheduleAppointmentDTO rescheduleAppointmentDTO,
            Authentication authentication)
    {
        return appointmentService.requestRescheduleServiceImpl(
                id,
                rescheduleAppointmentDTO,
                authentication
        );
    }

    @PatchMapping("/appointments/reschedule/accept/{id}")
    public Appointment acceptReschedule(
            @PathVariable int id,
            Authentication authentication)
    {
        return appointmentService.acceptRescheduleServiceImpl(
                id,
                authentication
        );
    }

    @PatchMapping("/appointments/reschedule/reject/{id}")
    public Appointment rejectReschedule(
            @PathVariable int id,
            Authentication authentication)
    {
        return appointmentService.rejectRescheduleServiceImpl(
                id,
                authentication
        );
    }
}