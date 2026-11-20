package com.doctorappointment.appoinment_service.exception;

public class InvalidAppointmentStatusException extends RuntimeException
{
    public InvalidAppointmentStatusException(String message)
    {
        super(message);
    }
}
