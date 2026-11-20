package com.doctorappointment.appoinment_service.exception;

public class PatientNotFoundException extends RuntimeException
{
    public PatientNotFoundException(String message)
    {
        super(message);
    }
}
