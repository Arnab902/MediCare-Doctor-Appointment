
package com.doctorappointment.patient_service.service;

import com.doctorappointment.patient_service.dto.PatientPatchDTO;
import com.doctorappointment.patient_service.dto.PatientRequestDTO;
import com.doctorappointment.patient_service.dto.PatientResponseDTO;
import com.doctorappointment.patient_service.dto.FamilyPatientRequestDTO;
import com.doctorappointment.patient_service.entity.User;
import com.doctorappointment.patient_service.exception.PatientNotFoundException;
import com.doctorappointment.patient_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class UserService
{
    @Autowired
    private UserRepository userRepository;

    public PatientResponseDTO findByAuthUserIdService(int authUserId)
    {
        Optional<User> userOptional =
                userRepository.findByAuthUserIdAndRelationship(
                        authUserId,
                        "SELF"
                );

        if (userOptional.isEmpty())
        {
            throw new PatientNotFoundException(
                    "Self patient profile not found for auth user"
            );
        }

        return convertToResponseDTO(userOptional.get());
    }

    public List<PatientResponseDTO> findMyProfilesService(int authUserId)
    {
        List<User> users = userRepository.findByAuthUserId(authUserId);

        if (users.isEmpty())
        {
            throw new PatientNotFoundException(
                    "No patient profiles found for auth user"
            );
        }

        return users.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public PatientResponseDTO saveUserService(
            PatientRequestDTO patientRequestDTO,
            Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        User user = new User();

        user.setAuthUserId(authUserId.intValue());
        user.setRelationship("SELF");
        user.setFullName(patientRequestDTO.getFullName());
        user.setEmail(patientRequestDTO.getEmail());
        user.setPhone(patientRequestDTO.getPhone());
        user.setAddress(patientRequestDTO.getAddress());
        user.setCity(patientRequestDTO.getCity());
        user.setState(patientRequestDTO.getState());
        user.setPincode(patientRequestDTO.getPincode());

        User savedUser = userRepository.save(user);

        return convertToResponseDTO(savedUser);
    }

    public PatientResponseDTO saveFamilyPatientService(
            FamilyPatientRequestDTO familyPatientRequestDTO,
            Authentication authentication)
    {
        Jwt jwt = (Jwt) authentication.getPrincipal();

        Long authUserId = jwt.getClaim("userId");

        User user = new User();

        user.setAuthUserId(authUserId.intValue());
        user.setRelationship(familyPatientRequestDTO.getRelationship());
        user.setFullName(familyPatientRequestDTO.getFullName());
        user.setEmail(familyPatientRequestDTO.getEmail());
        user.setPhone(familyPatientRequestDTO.getPhone());
        user.setAddress(familyPatientRequestDTO.getAddress());
        user.setCity(familyPatientRequestDTO.getCity());
        user.setState(familyPatientRequestDTO.getState());
        user.setPincode(familyPatientRequestDTO.getPincode());

        User savedUser = userRepository.save(user);

        return convertToResponseDTO(savedUser);
    }

    public List<PatientResponseDTO> findAllPatientService()
    {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public PatientResponseDTO findByIdPatientService(int id)
    {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty())
        {
            throw new PatientNotFoundException("Patient Not Found");
        }

        return convertToResponseDTO(userOptional.get());
    }

    public List<PatientResponseDTO> fetchPatientByNameService(String fullName)
    {
        List<User> users =
                userRepository.findByFullNameContainingIgnoreCase(fullName);

        if (users == null || users.isEmpty())
        {
            throw new PatientNotFoundException(
                    "Patient not found with name: " + fullName
            );
        }

        return users.stream()
                .map(this::convertToResponseDTO)
                .toList();
    }

    public PatientResponseDTO updatePatientByIdService(
            int id,
            PatientRequestDTO patientRequestDTO)
    {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty())
        {
            throw new PatientNotFoundException("Patient Not Found");
        }

        User userDb = userOptional.get();

        if (Objects.nonNull(patientRequestDTO.getFullName()))
        {
            userDb.setFullName(patientRequestDTO.getFullName());
        }

        if (Objects.nonNull(patientRequestDTO.getEmail()))
        {
            userDb.setEmail(patientRequestDTO.getEmail());
        }

        if (Objects.nonNull(patientRequestDTO.getPhone()))
        {
            userDb.setPhone(patientRequestDTO.getPhone());
        }

        if (Objects.nonNull(patientRequestDTO.getAddress()))
        {
            userDb.setAddress(patientRequestDTO.getAddress());
        }

        if (Objects.nonNull(patientRequestDTO.getCity()))
        {
            userDb.setCity(patientRequestDTO.getCity());
        }

        if (Objects.nonNull(patientRequestDTO.getState()))
        {
            userDb.setState(patientRequestDTO.getState());
        }

        if (Objects.nonNull(patientRequestDTO.getPincode()))
        {
            userDb.setPincode(patientRequestDTO.getPincode());
        }

        User updatedUser = userRepository.save(userDb);

        return convertToResponseDTO(updatedUser);
    }

    public PatientResponseDTO patchPatientByIdService(
            int id,
            PatientPatchDTO patientPatchDTO)
    {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty())
        {
            throw new PatientNotFoundException("Patient Not Available");
        }

        User userDb = userOptional.get();

        if (patientPatchDTO.getFullName() != null
                && !patientPatchDTO.getFullName().isBlank())
        {
            userDb.setFullName(patientPatchDTO.getFullName());
        }

        if (patientPatchDTO.getEmail() != null
                && !patientPatchDTO.getEmail().isBlank())
        {
            userDb.setEmail(patientPatchDTO.getEmail());
        }

        if (patientPatchDTO.getPhone() != null
                && !patientPatchDTO.getPhone().isBlank())
        {
            userDb.setPhone(patientPatchDTO.getPhone());
        }

        if (patientPatchDTO.getAddress() != null
                && !patientPatchDTO.getAddress().isBlank())
        {
            userDb.setAddress(patientPatchDTO.getAddress());
        }

        if (patientPatchDTO.getCity() != null
                && !patientPatchDTO.getCity().isBlank())
        {
            userDb.setCity(patientPatchDTO.getCity());
        }

        if (patientPatchDTO.getState() != null
                && !patientPatchDTO.getState().isBlank())
        {
            userDb.setState(patientPatchDTO.getState());
        }

        if (patientPatchDTO.getPincode() != null
                && !patientPatchDTO.getPincode().isBlank())
        {
            userDb.setPincode(patientPatchDTO.getPincode());
        }

        User updatedUser = userRepository.save(userDb);

        return convertToResponseDTO(updatedUser);
    }

    public void deleteByIdPatientService(int id)
    {
        Optional<User> userOptional = userRepository.findById(id);

        if (userOptional.isEmpty())
        {
            throw new PatientNotFoundException("Patient Not Found");
        }

        userRepository.deleteById(id);
    }

    // Converts Patient Entity into Patient Response DTO
    private PatientResponseDTO convertToResponseDTO(User user)
    {
        PatientResponseDTO responseDTO = new PatientResponseDTO();

        responseDTO.setId(user.getId());
        responseDTO.setAuthUserId(user.getAuthUserId());
        responseDTO.setRelationship(user.getRelationship());
        responseDTO.setFullName(user.getFullName());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setPhone(user.getPhone());
        responseDTO.setAddress(user.getAddress());
        responseDTO.setCity(user.getCity());
        responseDTO.setState(user.getState());
        responseDTO.setPincode(user.getPincode());

        return responseDTO;
    }

    public boolean isPatientBelongsToAuthUserService(
            int patientId,
            int authUserId)
    {
        Optional<User> userOptional =
                userRepository.findById(patientId);

        if (userOptional.isEmpty())
        {
            return false;
        }

        User user = userOptional.get();

        return user.getAuthUserId() == authUserId;
    }
}
