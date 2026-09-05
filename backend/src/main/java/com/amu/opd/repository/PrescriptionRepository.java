package com.amu.opd.repository;

import com.amu.opd.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Optional<Prescription> findByConsultationId(Long consultationId);
    List<Prescription> findByPatientIdOrderByCreatedAtDesc(Long patientId);
}
