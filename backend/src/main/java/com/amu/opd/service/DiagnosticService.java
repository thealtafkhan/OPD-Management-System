package com.amu.opd.service;

import com.amu.opd.dto.DiagnosticUploadRequest;
import com.amu.opd.entity.*;
import com.amu.opd.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class DiagnosticService {

    @Autowired
    private DiagnosticRequestRepository requestRepository;

    @Autowired
    private DiagnosticReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    private static final List<String> ALLOWED_FORMATS = Arrays.asList("pdf", "png", "jpg", "jpeg");

    public List<DiagnosticRequest> getPendingRequests(DiagnosticDiscipline discipline) {
        if (discipline != null) {
            return requestRepository.findByDisciplineAndStatusOrderByCreatedAtAsc(discipline, DiagnosticStatus.ORDERED);
        }
        return requestRepository.findAll();
    }

    @Transactional
    public DiagnosticReport uploadReport(DiagnosticUploadRequest uploadReq, Long reporterUserId) {
        DiagnosticRequest diagRequest = requestRepository.findById(uploadReq.getRequestId())
                .orElseThrow(() -> new RuntimeException("Diagnostic request not found"));

        User reporter = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new RuntimeException("Reporter user not found"));

        // File format validation
        if (uploadReq.getFileType() != null && !ALLOWED_FORMATS.contains(uploadReq.getFileType().toLowerCase())) {
            throw new RuntimeException("Invalid file format. Allowed formats: PDF, PNG, JPG, JPEG.");
        }

        // Check if report already exists and is finalized (tamper protection!)
        reportRepository.findByDiagnosticRequestId(diagRequest.getId()).ifPresent(existing -> {
            if (existing.isFinalized()) {
                throw new RuntimeException("This diagnostic report has already been finalized and locked against modifications.");
            }
        });

        DiagnosticReport report = reportRepository.findByDiagnosticRequestId(diagRequest.getId())
                .orElse(new DiagnosticReport());

        report.setDiagnosticRequest(diagRequest);
        report.setReporterUser(reporter);
        report.setFileName(uploadReq.getFileName());
        report.setFileType(uploadReq.getFileType());
        report.setFileUrl(uploadReq.getFileUrl());
        report.setReportSummary(uploadReq.getReportSummary());
        report.setFindings(uploadReq.getFindings());

        if (uploadReq.isFinalizeNow()) {
            report.setFinalized(true);
            report.setFinalizedAt(LocalDateTime.now());
            diagRequest.setStatus(DiagnosticStatus.FINALIZED);
            requestRepository.save(diagRequest);

            // Notify Doctor & Patient
            if (diagRequest.getDoctor().getUser() != null) {
                notificationService.sendNotification(
                        diagRequest.getDoctor().getUser(),
                        "Diagnostic Report Finalized: " + diagRequest.getTestName(),
                        "Report ready for patient " + diagRequest.getPatient().getFullName() + " (" + diagRequest.getPatient().getPatientId() + ").",
                        "REPORT"
                );
            }
            if (diagRequest.getPatient().getUser() != null) {
                notificationService.sendNotification(
                        diagRequest.getPatient().getUser(),
                        "Your Diagnostic Report Is Ready: " + diagRequest.getTestName(),
                        "Your " + diagRequest.getDiscipline().name() + " test report is now finalized and viewable on your portal.",
                        "REPORT"
                );
            }
        } else {
            diagRequest.setStatus(DiagnosticStatus.IN_PROGRESS);
            requestRepository.save(diagRequest);
        }

        return reportRepository.save(report);
    }
}
