
package com.doctorappointment.api_gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.LoadBalancerFilterFunctions.lb;
import static org.springframework.cloud.gateway.server.mvc.filter.FilterFunctions.addRequestHeader;
import static org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions.route;
import static org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions.http;
import static org.springframework.web.servlet.function.RequestPredicates.path;

@Configuration
public class RouteConfiguration {

    @Bean
    public RouterFunction<ServerResponse> authServiceRoute() {

        return route("auth-service")
                .route(path("/auth/**"), http())
                .filter(lb("AUTH-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> patientServiceRoute() {

        return route("patient-service")
                .route(path("/patients/**"), http())
                .filter(lb("PATIENT-SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> doctorServiceRoute() {

        return route("doctor-service")
                .route(path("/doctors/**"), http())
                .filter(addRequestHeader(
                        "X-Gateway-Request",
                        "MediCare-Gateway"
                ))
                .filter(lb("DOCTOR_SERVICE"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> appointmentServiceRoute() {

        return route("appointment-service")
                .route(path("/appointments/**"), http())
                .filter(lb("APPOINTMENT-SERVICE"))
                .build();
    }
}
