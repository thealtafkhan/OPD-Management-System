package com.amu.opd.repository;

import com.amu.opd.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    Optional<Consultation> findByAppointmentId(Long appointmentId);
    List<Consultation> findByPatientIdOrderByVisitDateDesc(Long patientId);
    List<Consultation> findByDoctorIdOrderByVisitDateDesc(Long doctorId);
}
