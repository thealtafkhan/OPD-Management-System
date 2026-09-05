package com.amu.opd.repository;

import com.amu.opd.entity.Patient;
import com.amu.opd.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientId(String patientId);
    Optional<Patient> findByUser(User user);
    Optional<Patient> findByUserId(Long userId);
    List<Patient> findByGuardianPatientId(String guardianPatientId);
    Optional<Patient> findTopByOrderByIdDesc();
    boolean existsByAadhaarRef(String aadhaarRef);
}
