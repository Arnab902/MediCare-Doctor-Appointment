package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.dto.AddressDTO;
import com.doctorappointment.doctor_service.dto.DoctorLocationDTO;
import com.doctorappointment.doctor_service.dto.DoctorRequestDTO;
import com.doctorappointment.doctor_service.dto.DoctorUpdateDTO;
import com.doctorappointment.doctor_service.entity.*;
import com.doctorappointment.doctor_service.exception.DoctorNotFoundException;
import com.doctorappointment.doctor_service.repository.DoctorLocationRepository;
import com.doctorappointment.doctor_service.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService
{
    private final DoctorRepository doctorRepository;
    private final DoctorLocationRepository doctorLocationRepository;

    public DoctorServiceImpl(
            DoctorRepository doctorRepository,
            DoctorLocationRepository doctorLocationRepository)
    {
        this.doctorRepository = doctorRepository;
        this.doctorLocationRepository = doctorLocationRepository;
    }


    @Override
    public Doctor findByAuthUserIdServiceImpl(int authUserId)
    {
        Optional<Doctor> doctorOptional = doctorRepository.findByAuthUserId(authUserId);

        if (doctorOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Not Found for auth user"
            );
        }

        return doctorOptional.get();
    }


    // =========================
    // A. Doctor Management
    // =========================

    @Override
    public Doctor saveDoctorServiceImpl(
            DoctorRequestDTO doctor,
            int authUserId)
    {
        Doctor d = new Doctor();

        d.setAuthUserId(authUserId);
        d.setProfileStatus(DoctorProfileStatus.PENDING);
        d.setFullName(doctor.getFullName());
        d.setEmail(doctor.getEmail());
        d.setPhoneNumber(doctor.getPhoneNumber());
        d.setSpecialization(doctor.getSpecialization());
        d.setQualification(doctor.getQualification());
        d.setExp(doctor.getExp());
        d.setLanguage(doctor.getLanguage());
        d.setProfileImage(doctor.getProfileImage());
        d.setAvailability(doctor.getAvailability());

        List<DoctorLocation> locations = new ArrayList<>();

        if (doctor.getLocations() != null)
        {
            for (DoctorLocationDTO locationDTO : doctor.getLocations())
            {
                DoctorLocation location =
                        convertToDoctorLocation(locationDTO);

                location.setDoctor(d);
                locations.add(location);
            }
        }

        d.setLocations(locations);

        return doctorRepository.save(d);
    }


    @Override
    public Doctor approveDoctor(int doctorId)
    {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        doctor.setProfileStatus(DoctorProfileStatus.APPROVED);

        return doctorRepository.save(doctor);
    }


    @Override
    public Doctor rejectDoctor(int doctorId)
    {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException("Doctor not found"));

        doctor.setProfileStatus(DoctorProfileStatus.REJECTED);

        return doctorRepository.save(doctor);
    }


    @Override
    public List<Doctor> findAllDoctorServiceImpl()
    {
        return doctorRepository.findAll();
    }


    @Override
    public Doctor findByIdDoctorServiceImpl(int id)
    {
        Optional<Doctor> doctorOptional =
                doctorRepository.findById(id);

        if (doctorOptional.isEmpty())
        {
            throw new DoctorNotFoundException("Doctor Not Found");
        }

        return doctorOptional.get();
    }


    @Override
    public List<Doctor> findDoctorByNameServiceImpl(String fullName)
    {
        List<Doctor> doctors =
                doctorRepository
                        .findByFullNameContainingIgnoreCase(fullName);

        if (doctors.isEmpty())
        {
            throw new DoctorNotFoundException("Doctor Not Found");
        }

        return doctors;
    }


    @Override
    public List<Doctor> findDoctorByspecializationServiceImpl(
            String specialization)
    {
        List<Doctor> doctors =
                doctorRepository
                        .findBySpecializationContainingIgnoreCase(
                                specialization);

        if (doctors.isEmpty())
        {
            throw new DoctorNotFoundException("Doctor Not Found");
        }

        return doctors;
    }


    @Override
    public Doctor updateDoctorByIdServiceImpl(
            int id,
            DoctorUpdateDTO doctor)
    {
        Doctor doctorDb =
                findByIdDoctorServiceImpl(id);

        if (Objects.nonNull(doctor.getFullName())
                && !doctor.getFullName().isBlank())
        {
            doctorDb.setFullName(doctor.getFullName());
        }

        if (Objects.nonNull(doctor.getEmail())
                && !doctor.getEmail().isBlank())
        {
            doctorDb.setEmail(doctor.getEmail());
        }

        if (Objects.nonNull(doctor.getPhoneNumber())
                && !doctor.getPhoneNumber().isBlank())
        {
            doctorDb.setPhoneNumber(doctor.getPhoneNumber());
        }

        if (Objects.nonNull(doctor.getSpecialization())
                && !doctor.getSpecialization().isBlank())
        {
            doctorDb.setSpecialization(
                    doctor.getSpecialization());
        }

        if (Objects.nonNull(doctor.getQualification())
                && !doctor.getQualification().isBlank())
        {
            doctorDb.setQualification(
                    doctor.getQualification());
        }

        if (doctor.getExp() != null)
        {
            doctorDb.setExp(doctor.getExp());
        }

        if (Objects.nonNull(doctor.getLanguage())
                && !doctor.getLanguage().isBlank())
        {
            doctorDb.setLanguage(doctor.getLanguage());
        }

        if (Objects.nonNull(doctor.getProfileImage())
                && !doctor.getProfileImage().isBlank())
        {
            doctorDb.setProfileImage(
                    doctor.getProfileImage());
        }

        if (Objects.nonNull(doctor.getAvailability()))
        {
            doctorDb.setAvailability(
                    doctor.getAvailability());
        }

        if (doctor.getLocations() != null)
        {
            doctorDb.getLocations().clear();

            for (DoctorLocationDTO locationDTO :
                    doctor.getLocations())
            {
                DoctorLocation location =
                        convertToDoctorLocation(locationDTO);

                location.setDoctor(doctorDb);
                doctorDb.getLocations().add(location);
            }
        }

        return doctorRepository.save(doctorDb);
    }


    @Override
    public void deleteByIdDoctorServiceImpl(int id)
    {
        Doctor doctor =
                findByIdDoctorServiceImpl(id);

        doctorRepository.delete(doctor);
    }


    @Override
    public List<Doctor> findAllDoctorsByLocationServiceImpl(
            int locationId)
    {
        Optional<DoctorLocation> locationOptional =
                doctorLocationRepository.findById(locationId);

        if (locationOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Location Not Found");
        }

        return List.of(
                locationOptional.get().getDoctor());
    }


    // =========================
    // C. Doctor Search & Filtering
    // =========================

    @Override
    public List<Doctor> findDoctorsByCityServiceImpl(
            String city)
    {
        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getAddress() != null
                                                && location.getAddress()
                                                .getCity()
                                                .equalsIgnoreCase(city)))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor> findDoctorsByStateServiceImpl(
            String state)
    {
        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getAddress() != null
                                                && location.getAddress()
                                                .getState()
                                                .equalsIgnoreCase(state)))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findDoctorsBySpecializationAndCityServiceImpl(
            String specialization,
            String city)
    {
        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getSpecialization()
                                .equalsIgnoreCase(specialization))
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getAddress() != null
                                                && location.getAddress()
                                                .getCity()
                                                .equalsIgnoreCase(city)))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findDoctorsBySpecializationAndStateServiceImpl(
            String specialization,
            String state)
    {
        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getSpecialization()
                                .equalsIgnoreCase(specialization))
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getAddress() != null
                                                && location.getAddress()
                                                .getState()
                                                .equalsIgnoreCase(state)))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findDoctorsBySpecializationAndLocationServiceImpl(
            String specialization,
            int locationId)
    {
        Optional<DoctorLocation> locationOptional =
                doctorLocationRepository.findById(locationId);

        if (locationOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Location Not Found");
        }

        Doctor doctor =
                locationOptional.get().getDoctor();

        if (!doctor.getSpecialization()
                .equalsIgnoreCase(specialization))
        {
            return new ArrayList<>();
        }

        return List.of(doctor);
    }


    @Override
    public List<Doctor>
    findDoctorsByConsultationTypeServiceImpl(
            String consultationType)
    {
        ConsultationType type =
                ConsultationType.valueOf(
                        consultationType.toUpperCase());

        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getConsultationType()
                                                == type))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findDoctorsBySpecializationAndConsultationTypeServiceImpl(
            String specialization,
            String consultationType)
    {
        ConsultationType type =
                ConsultationType.valueOf(
                        consultationType.toUpperCase());

        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getSpecialization()
                                .equalsIgnoreCase(specialization))
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getConsultationType()
                                                == type))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findDoctorsByCityAndConsultationTypeServiceImpl(
            String city,
            String consultationType)
    {
        ConsultationType type =
                ConsultationType.valueOf(
                        consultationType.toUpperCase());

        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getAddress() != null
                                                && location.getAddress()
                                                .getCity()
                                                .equalsIgnoreCase(city)
                                                && location.getConsultationType()
                                                == type))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findDoctorsBySpecializationAndCityAndConsultationTypeServiceImpl(
            String specialization,
            String city,
            String consultationType)
    {
        ConsultationType type =
                ConsultationType.valueOf(
                        consultationType.toUpperCase());

        return doctorRepository.findAll()
                .stream()
                .filter(doctor ->
                        doctor.getSpecialization()
                                .equalsIgnoreCase(specialization))
                .filter(doctor ->
                        doctor.getLocations() != null)
                .filter(doctor ->
                        doctor.getLocations()
                                .stream()
                                .anyMatch(location ->
                                        location.getAddress() != null
                                                && location.getAddress()
                                                .getCity()
                                                .equalsIgnoreCase(city)
                                                && location.getConsultationType()
                                                == type))
                .collect(Collectors.toList());
    }


    // =========================
    // D. Availability
    // =========================

    @Override
    public Boolean getDoctorAvailabilityServiceImpl(
            int doctorId)
    {
        Doctor doctor =
                findByIdDoctorServiceImpl(doctorId);

        return doctor.getAvailability();
    }


    @Override
    public Doctor updateDoctorAvailabilityServiceImpl(
            int doctorId,
            Boolean availability)
    {
        Doctor doctor =
                findByIdDoctorServiceImpl(doctorId);

        doctor.setAvailability(availability);

        return doctorRepository.save(doctor);
    }


    @Override
    public List<Doctor> findAvailableDoctorsServiceImpl()
    {
        return doctorRepository.findByAvailabilityTrue();
    }


    @Override
    public List<Doctor>
    findAvailableDoctorsBySpecializationServiceImpl(
            String specialization)
    {
        return doctorRepository
                .findBySpecializationContainingIgnoreCaseAndAvailabilityTrue(
                        specialization);
    }


    @Override
    public List<Doctor>
    findAvailableDoctorsByCityServiceImpl(
            String city)
    {
        return findDoctorsByCityServiceImpl(city)
                .stream()
                .filter(doctor ->
                        Boolean.TRUE.equals(
                                doctor.getAvailability()))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findAvailableDoctorsBySpecializationAndCityServiceImpl(
            String specialization,
            String city)
    {
        return findDoctorsBySpecializationAndCityServiceImpl(
                specialization,
                city)
                .stream()
                .filter(doctor ->
                        Boolean.TRUE.equals(
                                doctor.getAvailability()))
                .collect(Collectors.toList());
    }


    // =========================
    // E. Location + Availability
    // =========================

    @Override
    public List<Doctor>
    findAvailableDoctorsByLocationServiceImpl(
            int locationId)
    {
        return findAllDoctorsByLocationServiceImpl(
                locationId)
                .stream()
                .filter(doctor ->
                        Boolean.TRUE.equals(
                                doctor.getAvailability()))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findAvailableDoctorsByCityAndSpecializationServiceImpl(
            String city,
            String specialization)
    {
        return findDoctorsBySpecializationAndCityServiceImpl(
                specialization,
                city)
                .stream()
                .filter(doctor ->
                        Boolean.TRUE.equals(
                                doctor.getAvailability()))
                .collect(Collectors.toList());
    }


    @Override
    public List<Doctor>
    findAvailableDoctorsByCityAndSpecializationAndConsultationTypeServiceImpl(
            String city,
            String specialization,
            String consultationType)
    {
        return findDoctorsBySpecializationAndCityAndConsultationTypeServiceImpl(
                specialization,
                city,
                consultationType)
                .stream()
                .filter(doctor ->
                        Boolean.TRUE.equals(
                                doctor.getAvailability()))
                .collect(Collectors.toList());
    }


    // =========================
    // F. Doctor Details
    // =========================

    @Override
    public Doctor getDoctorDetailsWithLocationsServiceImpl(
            int doctorId)
    {
        return findByIdDoctorServiceImpl(doctorId);
    }


    @Override
    public List<DoctorLocation>
    getDoctorActiveLocationsServiceImpl(
            int doctorId)
    {
        findByIdDoctorServiceImpl(doctorId);

        return doctorLocationRepository
                .findByDoctorIdAndActiveTrue(doctorId);
    }


    @Override
    public List<DoctorLocation>
    getDoctorActiveConsultationOptionsServiceImpl(
            int doctorId)
    {
        findByIdDoctorServiceImpl(doctorId);

        return doctorLocationRepository
                .findByDoctorIdAndActiveTrue(doctorId);
    }


    // =========================
    // Helper Methods
    // =========================

    private DoctorLocation convertToDoctorLocation(
            DoctorLocationDTO dto)
    {
        DoctorLocation location =
                new DoctorLocation();

        location.setLocationName(
                dto.getLocationName());

        location.setConsultationType(
                dto.getConsultationType());

        location.setConsultationFee(
                dto.getConsultationFee());

        location.setActive(
                dto.getActive());


        // =========================
        // ADDRESS
        // =========================

        if (dto.getConsultationType()
                == ConsultationType.IN_PERSON)
        {
            AddressDTO addressDTO =
                    dto.getAddress();

            Address address =
                    new Address();

            address.setAddressLine(
                    addressDTO.getAddressLine());

            address.setCity(
                    addressDTO.getCity());

            address.setState(
                    addressDTO.getState());

            address.setCountry(
                    addressDTO.getCountry());

            address.setPinCode(
                    addressDTO.getPinCode());

            location.setAddress(address);
        }
        else
        {
            location.setAddress(null);
        }

        return location;
    }
}