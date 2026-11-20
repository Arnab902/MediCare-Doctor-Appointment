package com.doctorappointment.patient_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AuthServiceClientConfig {

    @Bean
    public RestTemplate authRestTemplate() {
        return new RestTemplate();
    }
}