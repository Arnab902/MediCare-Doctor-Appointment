package com.doctorappointment.appoinment_service.exception;

public class DoctorLocationNotFoundException extends RuntimeException {
    public DoctorLocationNotFoundException(String message) {
        super(message);
    }
}
