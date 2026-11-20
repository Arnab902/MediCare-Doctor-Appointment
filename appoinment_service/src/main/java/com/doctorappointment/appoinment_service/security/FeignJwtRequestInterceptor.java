package com.doctorappointment.appoinment_service.security;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignJwtRequestInterceptor
{
    private final ServiceJwtUtil serviceJwtUtil;

    public FeignJwtRequestInterceptor(ServiceJwtUtil serviceJwtUtil)
    {
        this.serviceJwtUtil = serviceJwtUtil;
    }

    @Bean
    public RequestInterceptor requestInterceptor()
    {
        return requestTemplate ->
        {
            String serviceToken =
                    serviceJwtUtil.generateServiceToken();

            System.out.println("===== FEIGN INTERCEPTOR RUNNING =====");
            System.out.println(
                    "Feign Request: " + requestTemplate.url()
            );

            requestTemplate.header(
                    "Authorization",
                    "Bearer " + serviceToken
            );
        };
    }
}