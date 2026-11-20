package com.doctorappointment.doctor_service.exception;

import com.doctorappointment.doctor_service.exception.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler
{
    // =========================
    // Doctor Not Found
    // =========================

    @ExceptionHandler(DoctorNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleDoctorNotFoundException(
            DoctorNotFoundException ex)
    {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }


    // =========================
    // Location Not Found
    // =========================

    @ExceptionHandler(LocationNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleLocationNotFoundException(
            LocationNotFoundException ex)
    {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }


    // =========================
    // Address Not Found
    // =========================

    @ExceptionHandler(AddressNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleAddressNotFoundException(
            AddressNotFoundException ex)
    {
        return buildErrorResponse(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
    }


    // =========================
    // Authorization Denied
    // =========================

    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAuthorizationDeniedException(
            AuthorizationDeniedException ex)
    {
        return buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "Access Denied"
        );
    }


    // =========================
    // Validation Error
    // =========================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex)
    {
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error ->
        {
            errors.put(
                    error.getField(),
                    error.getDefaultMessage()
            );
        });

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


    // =========================
    // Invalid Request
    // =========================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex)
    {
        return buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
    }


    // =========================
    // General Error
    // =========================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex)
    {
        return buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong"
        );
    }


    // =========================
    // Common Error Response
    // =========================

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            HttpStatus status,
            String message)
    {
        ErrorResponse errorResponse = new ErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, null
        );

        return new ResponseEntity<>(
                errorResponse,
                status
        );
    }
}