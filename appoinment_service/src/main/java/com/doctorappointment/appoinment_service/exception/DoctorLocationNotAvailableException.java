package com.doctorappointment.appoinment_service.exception;

public class DoctorLocationNotAvailableException extends RuntimeException {
    public DoctorLocationNotAvailableException(String message) {
        super(message);
    }
}
