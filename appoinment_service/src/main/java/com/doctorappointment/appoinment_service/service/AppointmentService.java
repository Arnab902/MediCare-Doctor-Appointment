package com.doctorappointment.appoinment_service.service;

import com.doctorappointment.appoinment_service.dto.AppointmentDTO;
import com.doctorappointment.appoinment_service.dto.AppointmentResponseDTO;
import com.doctorappointment.appoinment_service.dto.AppointmentUpdateDTO;
import com.doctorappointment.appoinment_service.dto.RescheduleAppointmentDTO;
import com.doctorappointment.appoinment_service.entity.Appointment;
import org.springframework.security.core.Authentication;

import java.util.List;

public interface AppointmentService
{
    Appointment createAppointmentServiceImpl(
            AppointmentDTO appointment,
            Authentication authentication
    );

    List<AppointmentResponseDTO> getAllAppointmentServiceImpl();

    AppointmentResponseDTO getAppointmentByIdServiceImpl(
            int id,
            Authentication authentication
    );

    List<AppointmentResponseDTO> getAppointmentsByPatientIdServiceImpl(
            int patientId
    );

    List<AppointmentResponseDTO> getAppointmentsByDoctorIdServiceImpl(
            int doctorId
    );

    Appointment updateAppointmentServiceImpl(
            int id,
            AppointmentUpdateDTO appointmentUpdateDTO,
            Authentication authentication
    );

    Appointment cancelAppointmentServiceImpl(
            int id,
            Authentication authentication
    );

    Appointment completeAppointmentServiceImpl(
            int id,
            Authentication authentication
    );

    Appointment requestRescheduleServiceImpl(
            int id,
            RescheduleAppointmentDTO rescheduleAppointmentDTO,
            Authentication authentication
    );

    Appointment acceptRescheduleServiceImpl(
            int id,
            Authentication authentication
    );

    Appointment rejectRescheduleServiceImpl(
            int id,
            Authentication authentication
    );

    List<AppointmentResponseDTO> getAppointmentsByPatientIdsServiceImpl(
            List<Integer> patientIds
    );
}