
package com.doctorappointment.doctor_service.security;

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

        // Requests without a JWT continue normally.
        if (token == null || !token.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check whether this is a trusted service-to-service JWT.
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {

            String service =
                    jwtAuthentication.getToken().getClaimAsString("service");

            String role =
                    jwtAuthentication.getToken().getClaimAsString("role");

            if ("appointment-service".equals(service)
                    && "APPOINTMENT_SERVICE".equals(role)) {

                // Spring Security has already validated the JWT signature
                // and expiration before this filter runs.
                filterChain.doFilter(request, response);
                return;
            }
        }

        // Normal user JWT: verify account status through Auth Service.
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.AUTHORIZATION, token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {

            ResponseEntity<String> authResponse =
                    authRestTemplate.exchange(
                            "http://localhost:8084/auth/profile",
                            HttpMethod.GET,
                            entity,
                            String.class
                    );

            if (!authResponse.getStatusCode().is2xxSuccessful()) {
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Account verification failed"
                );
                return;
            }

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

            return;

        } catch (RestClientException exception) {

            response.sendError(
                    HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Auth Service is unavailable."
            );

            return;
        }

        // Continue only after successful account verification.
        filterChain.doFilter(request, response);
    }
}
