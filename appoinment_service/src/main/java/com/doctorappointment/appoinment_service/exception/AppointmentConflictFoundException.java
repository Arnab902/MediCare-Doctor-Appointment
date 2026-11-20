package com.doctorappointment.appoinment_service.exception;

public class AppointmentConflictFoundException extends RuntimeException {
    public AppointmentConflictFoundException(String message) {
        super(message);
    }
}
