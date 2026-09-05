package com.amu.opd.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "diagnostic_reports")
public class DiagnosticReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "request_id", nullable = false)
    private DiagnosticRequest diagnosticRequest;

    @ManyToOne
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporterUser;

    private String fileName;
    private String fileType;
    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String reportSummary;

    @Column(columnDefinition = "TEXT")
    private String findings;

    private boolean finalized = false;
    private LocalDateTime finalizedAt;
    private LocalDateTime createdAt = LocalDateTime.now();

    public DiagnosticReport() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public DiagnosticRequest getDiagnosticRequest() { return diagnosticRequest; }
    public void setDiagnosticRequest(DiagnosticRequest diagnosticRequest) { this.diagnosticRequest = diagnosticRequest; }
    public User getReporterUser() { return reporterUser; }
    public void setReporterUser(User reporterUser) { this.reporterUser = reporterUser; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getReportSummary() { return reportSummary; }
    public void setReportSummary(String reportSummary) { this.reportSummary = reportSummary; }
    public String getFindings() { return findings; }
    public void setFindings(String findings) { this.findings = findings; }
    public boolean isFinalized() { return finalized; }
    public void setFinalized(boolean finalized) { this.finalized = finalized; }
    public LocalDateTime getFinalizedAt() { return finalizedAt; }
    public void setFinalizedAt(LocalDateTime finalizedAt) { this.finalizedAt = finalizedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
