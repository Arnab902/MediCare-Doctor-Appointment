package com.doctorappointment.appoinment_service.service;

import com.doctorappointment.appoinment_service.client.DoctorClient;
import com.doctorappointment.appoinment_service.client.PatientClient;
import com.doctorappointment.appoinment_service.dto.*;
import com.doctorappointment.appoinment_service.entity.Appointment;
import com.doctorappointment.appoinment_service.entity.AppointmentStatus;
import com.doctorappointment.appoinment_service.entity.RescheduleRequestStatus;
import com.doctorappointment.appoinment_service.exception.*;
import com.doctorappointment.appoinment_service.repository.AppointmentRepository;
import com.doctorappointment.appoinment_service.security.AppointmentAuthorizationService;

import feign.FeignException;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class AppointmentServiceImpl implements AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;
    private final AppointmentAuthorizationService authorizationService;

    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository,
            PatientClient patientClient,
            DoctorClient doctorClient,
            AppointmentAuthorizationService authorizationService) {
        this.appointmentRepository = appointmentRepository;
        this.patientClient = patientClient;
        this.doctorClient = doctorClient;
        this.authorizationService = authorizationService;
    }

    @Override
    public Appointment createAppointmentServiceImpl(
            AppointmentDTO appointment,
            Authentication authentication) {
        int patientId = appointment.getPatientId();

        if (!authorizationService.isPatientOwner(
                authentication,
                patientId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only book an appointment for your own patient profiles"
            );
        }

        DoctorResponseDTO doctor;

        try {
            doctor = doctorClient.getDoctorById(
                    appointment.getDoctorId()
            );
        } catch (FeignException.NotFound ex) {
            throw new DoctorNotFoundException(
                    "Doctor Not Found"
            );
        } catch (FeignException ex) {
            throw new DoctorServiceUnavailableException(
                    "Doctor Service is currently unavailable"
            );
        }

        if (Boolean.FALSE.equals(doctor.getAvailability())) {
            throw new DoctorNotAvailableException(
                    "Doctor is currently not available"
            );
        }

        DoctorLocationResponseDTO doctorLocation;

        try {
            doctorLocation = doctorClient.getDoctorLocationById(
                    appointment.getDoctorId(),
                    appointment.getDoctorLocationId()
            );
        } catch (FeignException.NotFound ex) {
            throw new DoctorLocationNotFoundException(
                    "Doctor Location Not Found"
            );
        } catch (FeignException ex) {
            throw new DoctorServiceUnavailableException(
                    "Doctor Service is currently unavailable"
            );
        }

        if (Boolean.FALSE.equals(doctorLocation.getActive())) {
            throw new DoctorLocationNotAvailableException(
                    "Doctor location is currently not available"
            );
        }

        if (doctorLocation.getConsultationType()
                != appointment.getConsultationType()) {
            throw new AppointmentConflictFoundException(
                    "Selected consultation type does not match the doctor location"
            );
        }

        boolean conflict =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                                appointment.getDoctorId(),
                                appointment.getAppointmentDate(),
                                appointment.getAppointmentTime()
                        );

        if (conflict) {
            throw new AppointmentConflictFoundException(
                    "Doctor already has an appointment at this date and time"
            );
        }

        Appointment ap = new Appointment();

        ap.setPatientId(patientId);
        ap.setDoctorId(appointment.getDoctorId());
        ap.setDoctorLocationId(appointment.getDoctorLocationId());
        ap.setAppointmentDate(appointment.getAppointmentDate());
        ap.setAppointmentTime(appointment.getAppointmentTime());
        ap.setConsultationType(appointment.getConsultationType());
        ap.setStatus(AppointmentStatus.BOOKED);
        ap.setRescheduleRequestStatus(RescheduleRequestStatus.NONE);
        ap.setReason(appointment.getReason());

        return appointmentRepository.save(ap);
    }

    @Override
    public List<AppointmentResponseDTO> getAllAppointmentServiceImpl() {
        List<Appointment> appointments =
                appointmentRepository.findAll();

        return convertToResponseDTOList(appointments);
    }

    @Override
    public AppointmentResponseDTO getAppointmentByIdServiceImpl(
            int id,
            Authentication authentication) {
        Optional<Appointment> optional =
                appointmentRepository.findById(id);

        if (optional.isEmpty()) {
            throw new AppointmentNotFoundException(
                    "Appointment not found"
            );
        }

        Appointment appointment = optional.get();

        /*
         * ADMIN can view any appointment.
         */
        if (authorizationService.isAdmin(authentication)) {
            return convertToResponseDTO(appointment);
        }

        /*
         * PATIENT can view appointments
         * belonging to their own patient profiles.
         */
        if (authorizationService.isPatient(authentication)) {
            int patientId = appointment.getPatientId();

            if (!authorizationService.isPatientOwner(
                    authentication,
                    patientId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to access this appointment"
                );
            }

            return convertToResponseDTO(appointment);
        }

        /*
         * DOCTOR can view only appointments belonging to them.
         */
        if (authorizationService.isDoctor(authentication)) {
            int doctorId =
                    authorizationService.getDoctorId(authentication);

            if (appointment.getDoctorId() != doctorId) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to access this appointment"
                );
            }

            return convertToResponseDTO(appointment);
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to access this appointment"
        );
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByPatientIdServiceImpl(
            int patientId) {
        List<Appointment> appointments =
                appointmentRepository.findByPatientId(patientId);

        return convertToResponseDTOList(appointments);
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByDoctorIdServiceImpl(
            int doctorId) {
        List<Appointment> appointments =
                appointmentRepository.findByDoctorId(doctorId);

        return convertToResponseDTOList(appointments);
    }

    @Override
    public Appointment updateAppointmentServiceImpl(
            int id,
            AppointmentUpdateDTO appointmentUpdateDTO,
            Authentication authentication) {
        Optional<Appointment> appointmentOptional =
                appointmentRepository.findById(id);

        if (appointmentOptional.isEmpty()) {
            throw new AppointmentNotFoundException(
                    "Appointment Not Available"
            );
        }

        Appointment appointmentDb = appointmentOptional.get();

        /*
         * ADMIN can update any appointment.
         *
         * PATIENT can update appointments belonging
         * to any of their own patient profiles.
         *
         * DOCTOR can update only appointments belonging
         * to their own doctor profile.
         */
        if (authorizationService.isAdmin(authentication)) {
            // ADMIN is allowed to continue.
        } else if (authorizationService.isPatient(authentication)) {
            boolean patientOwner =
                    authorizationService.isPatientOwner(
                            authentication,
                            appointmentDb.getPatientId()
                    );

            if (!patientOwner) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to update this appointment"
                );
            }
        } else if (authorizationService.isDoctor(authentication)) {
            int doctorId =
                    authorizationService.getDoctorId(authentication);

            if (appointmentDb.getDoctorId() != doctorId) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to update this appointment"
                );
            }
        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to update appointments"
            );
        }

        /*
         * Only BOOKED appointments can be updated.
         */
        if (appointmentDb.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidAppointmentStatusException(
                    "Appointment cannot be updated because it is already "
                            + appointmentDb.getStatus()
            );
        }

        DoctorResponseDTO doctor;

        try {
            doctor = doctorClient.getDoctorById(
                    appointmentDb.getDoctorId()
            );
        } catch (FeignException.NotFound ex) {
            throw new DoctorNotFoundException(
                    "Doctor Not Found"
            );
        } catch (FeignException ex) {
            throw new DoctorServiceUnavailableException(
                    "Doctor Service is currently unavailable"
            );
        }

        if (Boolean.FALSE.equals(doctor.getAvailability())) {
            throw new DoctorNotAvailableException(
                    "Doctor is currently not available"
            );
        }

        LocalDate newDate =
                Objects.nonNull(
                        appointmentUpdateDTO.getAppointmentDate()
                )
                        ? appointmentUpdateDTO.getAppointmentDate()
                        : appointmentDb.getAppointmentDate();

        LocalTime newTime =
                Objects.nonNull(
                        appointmentUpdateDTO.getAppointmentTime()
                )
                        ? appointmentUpdateDTO.getAppointmentTime()
                        : appointmentDb.getAppointmentTime();

        boolean conflict =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndIdNot(
                                appointmentDb.getDoctorId(),
                                newDate,
                                newTime,
                                id
                        );

        if (conflict) {
            throw new AppointmentConflictFoundException(
                    "Doctor already has an appointment at this date and time"
            );
        }

        appointmentDb.setAppointmentDate(newDate);
        appointmentDb.setAppointmentTime(newTime);

        if (Objects.nonNull(appointmentUpdateDTO.getReason())
                && !appointmentUpdateDTO.getReason().isBlank()) {
            appointmentDb.setReason(
                    appointmentUpdateDTO.getReason()
            );
        }

        /*
         * These fields are intentionally NOT changed:
         *
         * patientId
         * doctorId
         * doctorLocationId
         * consultationType
         * status
         */
        return appointmentRepository.save(appointmentDb);
    }

    @Override
    public Appointment cancelAppointmentServiceImpl(
            int id,
            Authentication authentication) {
        Optional<Appointment> appointmentOptional =
                appointmentRepository.findById(id);

        if (appointmentOptional.isEmpty()) {
            throw new AppointmentNotFoundException(
                    "Appointment Not Available"
            );
        }

        Appointment appointment = appointmentOptional.get();

        /*
         * ADMIN can cancel any appointment.
         */
        if (authorizationService.isAdmin(authentication)) {
            // Admin is allowed to continue.
        }

        /*
         * PATIENT can cancel appointments
         * belonging to their own patient profiles.
         */
        else if (authorizationService.isPatient(authentication)) {
            int patientId = appointment.getPatientId();

            if (!authorizationService.isPatientOwner(
                    authentication,
                    patientId)) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to cancel this appointment"
                );
            }
        }

        /*
         * DOCTOR can cancel only appointments belonging
         * to their own doctor profile.
         */
        else if (authorizationService.isDoctor(authentication)) {
            int doctorId =
                    authorizationService.getDoctorId(authentication);

            if (appointment.getDoctorId() != doctorId) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to cancel this appointment"
                );
            }
        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to cancel appointments"
            );
        }

        /*
         * Appointment must still be BOOKED.
         */
        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidAppointmentStatusException(
                    "Appointment cannot be cancelled because it is already "
                            + appointment.getStatus()
            );
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment completeAppointmentServiceImpl(
            int id,
            Authentication authentication) {
        Optional<Appointment> appointmentOptional =
                appointmentRepository.findById(id);

        if (appointmentOptional.isEmpty()) {
            throw new AppointmentNotFoundException(
                    "Appointment Not Available"
            );
        }

        Appointment appointment = appointmentOptional.get();

        /*
         * ADMIN can complete any appointment.
         */
        if (authorizationService.isAdmin(authentication)) {
            // ADMIN is allowed to continue.
        }

        /*
         * DOCTOR can complete only appointments
         * belonging to their own doctor profile.
         */
        else if (authorizationService.isDoctor(authentication)) {
            int doctorId =
                    authorizationService.getDoctorId(authentication);

            if (appointment.getDoctorId() != doctorId) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to complete this appointment"
                );
            }
        }

        /*
         * PATIENT and any other role cannot complete
         * an appointment.
         */
        else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to complete appointments"
            );
        }

        /*
         * Only BOOKED appointments can be completed.
         */
        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidAppointmentStatusException(
                    "Appointment cannot be completed because it is already "
                            + appointment.getStatus()
            );
        }

        /*
         * Appointment date and time must be available.
         */
        if (appointment.getAppointmentDate() == null
                || appointment.getAppointmentTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment date and time are missing"
            );
        }

        /*
         * Prevent completion before the scheduled date and time.
         * Uses Indian Standard Time (IST).
         */
        LocalDateTime scheduledDateTime = LocalDateTime.of(
                appointment.getAppointmentDate(),
                appointment.getAppointmentTime()
        );

        LocalDateTime currentDateTime = LocalDateTime.now(
                ZoneId.of("Asia/Kolkata")
        );

        if (currentDateTime.isBefore(scheduledDateTime)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Appointment cannot be completed before its scheduled date and time"
            );
        }

        /*
         * Mark appointment as completed.
         */
        appointment.setStatus(AppointmentStatus.COMPLETED);

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment requestRescheduleServiceImpl(
            int id,
            RescheduleAppointmentDTO rescheduleAppointmentDTO,
            Authentication authentication) {
        /*
         * Only PATIENT can request a reschedule.
         */
        if (!authorizationService.isPatient(authentication)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only PATIENT can request reschedule"
            );
        }

        /*
         * Find the appointment.
         */
        Appointment appointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new AppointmentNotFoundException(
                                        "Appointment not found"
                                )
                        );

        /*
         * PATIENT can request reschedule only for
         * appointments belonging to their own patient profiles.
         */
        boolean patientOwner =
                authorizationService.isPatientOwner(
                        authentication,
                        appointment.getPatientId()
                );

        if (!patientOwner) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only request reschedule for your own appointment"
            );
        }

        /*
         * Only BOOKED appointments can be rescheduled.
         */
        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidAppointmentStatusException(
                    "Appointment cannot be rescheduled because it is already "
                            + appointment.getStatus()
            );
        }

        /*
         * A new reschedule request cannot be created
         * while another request is already pending.
         */
        if (appointment.getRescheduleRequestStatus()
                == RescheduleRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "A reschedule request is already pending"
            );
        }

        /*
         * Save requested date and time.
         */
        appointment.setRequestedAppointmentDate(
                rescheduleAppointmentDTO.getAppointmentDate()
        );

        appointment.setRequestedAppointmentTime(
                rescheduleAppointmentDTO.getAppointmentTime()
        );

        appointment.setRescheduleRequestStatus(
                RescheduleRequestStatus.PENDING
        );

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment acceptRescheduleServiceImpl(
            int id,
            Authentication authentication) {
        // Only DOCTOR can accept a reschedule request
        if (!authorizationService.isDoctor(authentication)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only DOCTOR can accept reschedule"
            );
        }

        Appointment appointment = appointmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new AppointmentNotFoundException(
                                "Appointment not found with id: " + id
                        )
                );

        int doctorId =
                authorizationService.getDoctorId(authentication);

        if (appointment.getDoctorId() != doctorId) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only accept reschedule for your own appointments"
            );
        }

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new InvalidAppointmentStatusException(
                    "Appointment cannot be rescheduled because it is already "
                            + appointment.getStatus()
            );
        }

        if (appointment.getRescheduleRequestStatus()
                != RescheduleRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "There is no pending reschedule request"
            );
        }

        if (appointment.getRequestedAppointmentDate() == null
                || appointment.getRequestedAppointmentTime() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Requested appointment date and time are missing"
            );
        }

        boolean conflictExists =
                appointmentRepository
                        .existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndIdNot(
                                appointment.getDoctorId(),
                                appointment.getRequestedAppointmentDate(),
                                appointment.getRequestedAppointmentTime(),
                                appointment.getId()
                        );

        if (conflictExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Requested appointment time is already booked"
            );
        }

        appointment.setAppointmentDate(
                appointment.getRequestedAppointmentDate()
        );

        appointment.setAppointmentTime(
                appointment.getRequestedAppointmentTime()
        );

        appointment.setRescheduleRequestStatus(
                RescheduleRequestStatus.ACCEPTED
        );

        appointment.setRequestedAppointmentDate(null);
        appointment.setRequestedAppointmentTime(null);

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment rejectRescheduleServiceImpl(
            int id,
            Authentication authentication) {
        if (!authorizationService.isDoctor(authentication)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only DOCTOR can reject reschedule requests"
            );
        }

        Appointment appointment =
                appointmentRepository.findById(id)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Appointment not found"
                                ));

        int doctorId =
                authorizationService.getDoctorId(authentication);

        if (appointment.getDoctorId() != doctorId) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only reject reschedule requests for your appointments"
            );
        }

        if (appointment.getStatus() != AppointmentStatus.BOOKED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only BOOKED appointments can be rescheduled"
            );
        }

        if (appointment.getRescheduleRequestStatus()
                != RescheduleRequestStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No pending reschedule request"
            );
        }

        appointment.setRescheduleRequestStatus(
                RescheduleRequestStatus.REJECTED
        );

        appointment.setRequestedAppointmentDate(null);
        appointment.setRequestedAppointmentTime(null);

        return appointmentRepository.save(appointment);
    }

    @Override
    public List<AppointmentResponseDTO> getAppointmentsByPatientIdsServiceImpl(
            List<Integer> patientIds) {
        List<Appointment> appointments =
                appointmentRepository.findByPatientIdIn(patientIds);

        return convertToResponseDTOList(appointments);
    }

    /*
     * Convert a list of Appointment entities
     * into AppointmentResponseDTO objects.
     */
    private List<AppointmentResponseDTO> convertToResponseDTOList(
            List<Appointment> appointments) {
        return appointments.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    /*
     * Convert one Appointment entity into
     * AppointmentResponseDTO.
     * Fetches both patient name and doctor name.
     */
    private AppointmentResponseDTO convertToResponseDTO(
            Appointment appointment) {
        AppointmentResponseDTO response =
                new AppointmentResponseDTO();

        response.setId(appointment.getId());

        response.setPatientId(
                appointment.getPatientId()
        );

        response.setDoctorId(
                appointment.getDoctorId()
        );

        response.setDoctorLocationId(
                appointment.getDoctorLocationId()
        );

        response.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        response.setRequestedAppointmentDate(
                appointment.getRequestedAppointmentDate()
        );

        response.setRequestedAppointmentTime(
                appointment.getRequestedAppointmentTime()
        );

        response.setStatus(
                appointment.getStatus()
        );

        response.setConsultationType(
                appointment.getConsultationType()
        );

        response.setRescheduleRequestStatus(
                appointment.getRescheduleRequestStatus()
        );

        response.setReason(
                appointment.getReason()
        );

        /*
         * Fetch patient name from Patient Service.
         */
        try {
            PatientResponseDTO patient =
                    patientClient.getPatientById(
                            appointment.getPatientId()
                    );

            if (patient != null) {
                System.out.println(
                        "PATIENT FOUND: ID = "
                                + patient.getId()
                                + ", NAME = "
                                + patient.getFullName()
                );

                response.setPatientName(
                        patient.getFullName()
                );
            } else {
                response.setPatientName(
                        "Patient not found"
                );
            }
        } catch (FeignException.NotFound ex) {
            response.setPatientName(
                    "Patient not found"
            );
        } catch (FeignException ex) {
            System.out.println(
                    "Patient Service Error: "
                            + ex.status()
                            + " - "
                            + ex.getMessage()
            );

            response.setPatientName(
                    "Patient information unavailable"
            );
        }

        /*
         * Fetch doctor name from Doctor Service.
         */
        try {
            DoctorResponseDTO doctor =
                    doctorClient.getDoctorById(
                            appointment.getDoctorId()
                    );

            if (doctor != null) {
                response.setDoctorName(
                        doctor.getFullName()
                );
            } else {
                response.setDoctorName(
                        "Doctor not found"
                );
            }
        } catch (FeignException.NotFound ex) {
            response.setDoctorName(
                    "Doctor not found"
            );
        } catch (FeignException ex) {
            System.out.println(
                    "Doctor Service Error: "
                            + ex.status()
                            + " - "
                            + ex.getMessage()
            );

            response.setDoctorName(
                    "Doctor information unavailable"
            );
        }

        return response;
    }
}