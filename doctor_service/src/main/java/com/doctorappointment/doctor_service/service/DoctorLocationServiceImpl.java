 package com.doctorappointment.doctor_service.service;

import com.doctorappointment.doctor_service.dto.AddressDTO;
import com.doctorappointment.doctor_service.dto.DoctorLocationDTO;
import com.doctorappointment.doctor_service.entity.Address;
import com.doctorappointment.doctor_service.entity.ConsultationType;
import com.doctorappointment.doctor_service.entity.Doctor;
import com.doctorappointment.doctor_service.entity.DoctorLocation;
import com.doctorappointment.doctor_service.exception.DoctorNotFoundException;
import com.doctorappointment.doctor_service.repository.DoctorLocationRepository;
import com.doctorappointment.doctor_service.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorLocationServiceImpl implements DoctorLocationService
{
    private final DoctorRepository doctorRepository;
    private final DoctorLocationRepository doctorLocationRepository;

    public DoctorLocationServiceImpl(
            DoctorRepository doctorRepository,
            DoctorLocationRepository doctorLocationRepository)
    {
        this.doctorRepository = doctorRepository;
        this.doctorLocationRepository = doctorLocationRepository;
    }


    // =========================
    // B. Doctor Location Management
    // =========================

    @Override
    public DoctorLocation saveDoctorLocationServiceImpl(
            int doctorId,
            DoctorLocationDTO doctorLocationDTO)
    {
        Doctor doctor = findDoctor(doctorId);

        validateLocationData(doctorLocationDTO);

        DoctorLocation location =
                convertToDoctorLocation(doctorLocationDTO);

        location.setDoctor(doctor);

        return doctorLocationRepository.save(location);
    }


    @Override
    public List<DoctorLocation> findAllDoctorLocationsServiceImpl(
            int doctorId)
    {
        findDoctor(doctorId);

        return doctorLocationRepository.findByDoctorId(doctorId);
    }


    @Override
    public DoctorLocation findDoctorLocationByIdServiceImpl(
            int doctorId,
            int locationId)
    {
        findDoctor(doctorId);

        Optional<DoctorLocation> locationOptional =
                doctorLocationRepository
                        .findByIdAndDoctorId(
                                locationId,
                                doctorId);

        if (locationOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Location Not Found");
        }

        return locationOptional.get();
    }


    @Override
    public DoctorLocation updateDoctorLocationServiceImpl(
            int doctorId,
            int locationId,
            DoctorLocationDTO doctorLocationDTO)
    {
        DoctorLocation location =
                findDoctorLocationByIdServiceImpl(
                        doctorId,
                        locationId);

        validateLocationData(doctorLocationDTO);

        location.setLocationName(
                doctorLocationDTO.getLocationName());

        location.setConsultationType(
                doctorLocationDTO.getConsultationType());

        location.setConsultationFee(
                doctorLocationDTO.getConsultationFee());

        location.setActive(
                doctorLocationDTO.getActive());


        // =========================
        // ADDRESS HANDLING
        // =========================

        if (doctorLocationDTO.getConsultationType()
                == ConsultationType.VIDEO)
        {
            location.setAddress(null);
        }
        else
        {
            Address address = location.getAddress();

            if (address == null)
            {
                address = new Address();
            }

            AddressDTO addressDTO =
                    doctorLocationDTO.getAddress();

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

        return doctorLocationRepository.save(location);
    }


    @Override
    public void deleteDoctorLocationServiceImpl(
            int doctorId,
            int locationId)
    {
        DoctorLocation location =
                findDoctorLocationByIdServiceImpl(
                        doctorId,
                        locationId);

        doctorLocationRepository.delete(location);
    }


    @Override
    public DoctorLocation activateDoctorLocationServiceImpl(
            int doctorId,
            int locationId)
    {
        DoctorLocation location =
                findDoctorLocationByIdServiceImpl(
                        doctorId,
                        locationId);

        location.setActive(true);

        return doctorLocationRepository.save(location);
    }


    @Override
    public DoctorLocation deactivateDoctorLocationServiceImpl(
            int doctorId,
            int locationId)
    {
        DoctorLocation location =
                findDoctorLocationByIdServiceImpl(
                        doctorId,
                        locationId);

        location.setActive(false);

        return doctorLocationRepository.save(location);
    }


    // =========================
    // Helper Methods
    // =========================

    private Doctor findDoctor(int doctorId)
    {
        Optional<Doctor> doctorOptional =
                doctorRepository.findById(doctorId);

        if (doctorOptional.isEmpty())
        {
            throw new DoctorNotFoundException(
                    "Doctor Not Found");
        }

        return doctorOptional.get();
    }


    private void validateLocationData(
            DoctorLocationDTO dto)
    {
        if (dto.getConsultationType()
                == ConsultationType.IN_PERSON
                && dto.getAddress() == null)
        {
            throw new IllegalArgumentException(
                    "Address is required for in-person consultation");
        }
    }


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

