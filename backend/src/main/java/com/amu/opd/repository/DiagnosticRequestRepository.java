package com.amu.opd.repository;

import com.amu.opd.entity.DiagnosticDiscipline;
import com.amu.opd.entity.DiagnosticRequest;
import com.amu.opd.entity.DiagnosticStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiagnosticRequestRepository extends JpaRepository<DiagnosticRequest, Long> {
    List<DiagnosticRequest> findByDisciplineAndStatusOrderByCreatedAtAsc(DiagnosticDiscipline discipline, DiagnosticStatus status);
    List<DiagnosticRequest> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    List<DiagnosticRequest> findByConsultationId(Long consultationId);
}
