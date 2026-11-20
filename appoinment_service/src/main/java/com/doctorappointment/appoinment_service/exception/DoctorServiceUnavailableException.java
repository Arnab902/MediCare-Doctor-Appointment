package com.doctorappointment.appoinment_service.exception;

public class DoctorServiceUnavailableException extends RuntimeException {
    public DoctorServiceUnavailableException(String message) {
        super(message);
    }
}
