
package com.doctorappointment.appoinment_service.exception;

import feign.FeignException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Appointment not found
    @ExceptionHandler(AppointmentNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAppointmentNotFoundException(
            AppointmentNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }

    // Appointment Conflict
    @ExceptionHandler(AppointmentConflictFoundException.class)
    public ResponseEntity<ErrorResponse> handleAppointmentConflictException(
            AppointmentConflictFoundException ex) {
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
    }

    // Doctor Not Available
    @ExceptionHandler(DoctorNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleDoctorNotAvailableException(
            DoctorNotAvailableException ex) {
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
    }

    // Appointment status conflict
    @ExceptionHandler(InvalidAppointmentStatusException.class)
    public ResponseEntity<ErrorResponse> handleInvalidAppointmentStatusException(
            InvalidAppointmentStatusException ex) {
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
    }

    // Patient not found
    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePatientNotFoundException(
            PatientNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }

    // Doctor not found
    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDoctorNotFoundException(
            DoctorNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }

    // Patient service unavailable
    @ExceptionHandler(PatientServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handlePatientServiceUnavailableException(
            PatientServiceUnavailableException ex) {
        return buildErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                ex.getMessage()
        );
    }

    // Doctor service unavailable
    @ExceptionHandler(DoctorServiceUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleDoctorServiceUnavailableException(
            DoctorServiceUnavailableException ex) {
        return buildErrorResponse(
                HttpStatus.SERVICE_UNAVAILABLE,
                ex.getMessage()
        );
    }

    // Doctor Location Not Found
    @ExceptionHandler(DoctorLocationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDoctorLocationNotFoundException(
            DoctorLocationNotFoundException ex) {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }

    // Doctor Location Not Available
    @ExceptionHandler(DoctorLocationNotAvailableException.class)
    public ResponseEntity<ErrorResponse> handleDoctorLocationNotAvailableException(
            DoctorLocationNotAvailableException ex) {
        return buildErrorResponse(
                HttpStatus.CONFLICT,
                ex.getMessage()
        );
    }

    // Validation Error
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(
                        error.getField(),
                        error.getDefaultMessage()
                )
        );

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Validation failed",
                errors
        );

        return new ResponseEntity<>(
                errorResponse,
                HttpStatus.BAD_REQUEST
        );
    }

    // Feign Forbidden - Blocked account
    @ExceptionHandler(FeignException.Forbidden.class)
    public ResponseEntity<ErrorResponse> handleFeignForbidden(
            FeignException.Forbidden ex) {

        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "Your account has been blocked."
        );
    }

    // Feign Unauthorized
    @ExceptionHandler(FeignException.Unauthorized.class)
    public ResponseEntity<ErrorResponse> handleFeignUnauthorized(
            FeignException.Unauthorized ex) {

        return buildErrorResponse(
                HttpStatus.UNAUTHORIZED,
                "Invalid or expired token."
        );
    }

    // Authorization / HTTP status error
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(
            ResponseStatusException ex) {

        return buildErrorResponse(
                HttpStatus.valueOf(ex.getStatusCode().value()),
                ex.getReason() != null
                        ? ex.getReason()
                        : "Request failed"
        );
    }

    // General error
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex) {

        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage()
        );
    }

    // Common Error Response Builder
    private ResponseEntity<ErrorResponse> buildErrorResponse(
            HttpStatus status,
            String message) {

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                null
        );

        return new ResponseEntity<>(
                errorResponse,
                status
        );
    }
}
