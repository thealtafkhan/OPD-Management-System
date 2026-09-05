package com.amu.opd.dto;

public class DiagnosticUploadRequest {
    private Long requestId;
    private String fileName;
    private String fileType; // pdf, png, jpg
    private String fileUrl;
    private String reportSummary;
    private String findings;
    private boolean finalizeNow;

    public DiagnosticUploadRequest() {}

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }
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
    public boolean isFinalizeNow() { return finalizeNow; }
    public void setFinalizeNow(boolean finalizeNow) { this.finalizeNow = finalizeNow; }
}
