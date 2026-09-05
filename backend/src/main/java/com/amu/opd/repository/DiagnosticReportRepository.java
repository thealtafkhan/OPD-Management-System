package com.amu.opd.repository;

import com.amu.opd.entity.DiagnosticReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiagnosticReportRepository extends JpaRepository<DiagnosticReport, Long> {
    Optional<DiagnosticReport> findByDiagnosticRequestId(Long diagnosticRequestId);
}
