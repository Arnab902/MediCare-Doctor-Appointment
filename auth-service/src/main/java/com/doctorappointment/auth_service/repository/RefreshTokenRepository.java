package com.doctorappointment.auth_service.repository;

import com.doctorappointment.auth_service.entity.RefreshToken;
import com.doctorappointment.auth_service.entity.User;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer>
{

    @EntityGraph(attributePaths = "user")
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    void deleteByTokenHash(String tokenHash);

    List<RefreshToken> findAllByUser(User user);
}