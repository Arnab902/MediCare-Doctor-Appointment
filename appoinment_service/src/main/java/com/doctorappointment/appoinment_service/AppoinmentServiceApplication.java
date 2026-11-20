package com.doctorappointment.appoinment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AppoinmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppoinmentServiceApplication.class, args);
	}

}
