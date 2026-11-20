package com.doctorappointment.auth_service.filter;

import com.doctorappointment.auth_service.entity.AccountStatus;
import com.doctorappointment.auth_service.entity.User;
import com.doctorappointment.auth_service.repository.UserRepository;
import com.doctorappointment.auth_service.util.JwtUtil;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtRequestFilter(JwtUtil jwtUtil, UserRepository userRepository)
    {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null &&
                authorizationHeader.startsWith("Bearer ")) {

            String token = authorizationHeader.substring(7);

            try {
                Claims claims = jwtUtil.extractClaims(token);

                String email = claims.get("email", String.class);

                if (email == null) {
                    response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "Invalid token"
                    );
                    return;
                }

                User user = userRepository.findByEmail(email)
                        .orElse(null);

                if (user == null) {
                    response.sendError(
                            HttpServletResponse.SC_UNAUTHORIZED,
                            "User not found"
                    );
                    return;
                }

                // Check the latest account status from database
                if (user.getAccountStatus() == AccountStatus.BLOCKED) {

                    SecurityContextHolder.clearContext();

                    response.sendError(
                            HttpServletResponse.SC_FORBIDDEN,
                            "Your account has been blocked. Please contact support."
                    );
                    return;
                }

                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority(
                                    "ROLE_" + user.getRole().name()
                            );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    user.getEmail(),
                                    null,
                                    List.of(authority)
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }

            } catch (JwtException | IllegalArgumentException e) {

                SecurityContextHolder.clearContext();

                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Invalid or expired token"
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
