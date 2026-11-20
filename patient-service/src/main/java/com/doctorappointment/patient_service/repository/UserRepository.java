package com.doctorappointment.patient_service.repository;

import com.doctorappointment.patient_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer>
{
    public List<User> findByFullNameContainingIgnoreCase(String fullName);

    List<User> findByAuthUserId(int authUserId);

    Optional<User> findByAuthUserIdAndRelationship(int authUserId, String relationship);
}