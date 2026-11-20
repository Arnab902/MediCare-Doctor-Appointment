package com.doctorappointment.appoinment_service.exception;

public class PatientServiceUnavailableException extends RuntimeException {
    public PatientServiceUnavailableException(String message) {
        super(message);
    }
}
