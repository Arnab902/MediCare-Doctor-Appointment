
package com.doctorappointment.patient_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;

import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class AccountStatusFilter extends OncePerRequestFilter {

    private final RestTemplate authRestTemplate;

    public AccountStatusFilter(RestTemplate authRestTemplate) {
        this.authRestTemplate = authRestTemplate;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = request.getHeader(HttpHeaders.AUTHORIZATION);

        // Allow requests without a Bearer token to continue.
        // Spring Security will handle authentication.
        if (token == null || !token.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // JWT authentication must already be completed
        // because this filter runs after BearerTokenAuthenticationFilter.
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwtAuthentication)) {
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Invalid authentication"
            );
            return;
        }

        Jwt jwt = jwtAuthentication.getToken();

        // Identify trusted Appointment Service token.
        String service = jwt.getClaimAsString("service");
        String role = jwt.getClaimAsString("role");

        if ("appointment-service".equals(service)
                && "APPOINTMENT_SERVICE".equals(role)) {

            // JWT signature and expiration have already been
            // validated by Spring Security's JwtDecoder.
            // Appointment Service checks the actual patient's
            // account status before making this Feign request.
            filterChain.doFilter(request, response);
            return;
        }

        // Normal user JWT: verify the latest account status
        // using Auth Service.
        HttpHeaders headers = new HttpHeaders();
        headers.set(
                HttpHeaders.AUTHORIZATION,
                token
        );

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {

            ResponseEntity<String> authResponse =
                    authRestTemplate.exchange(
                            "http://localhost:8084/auth/profile",
                            HttpMethod.GET,
                            entity,
                            String.class
                    );

            if (authResponse.getStatusCode().is2xxSuccessful()) {
                filterChain.doFilter(request, response);
                return;
            }

            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "Account verification failed"
            );

        } catch (HttpStatusCodeException exception) {

            if (exception.getStatusCode() == HttpStatus.FORBIDDEN) {

                response.sendError(
                        HttpServletResponse.SC_FORBIDDEN,
                        "Your account has been blocked."
                );

            } else if (exception.getStatusCode() == HttpStatus.UNAUTHORIZED) {

                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid or expired token"
                );

            } else {

                response.sendError(
                        HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                        "Unable to verify account status"
                );
            }

        } catch (RestClientException exception) {

            response.sendError(
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Auth Service is unavailable."
            );
        }
    }
}
