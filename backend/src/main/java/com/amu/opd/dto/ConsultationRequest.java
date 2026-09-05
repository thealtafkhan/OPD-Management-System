package com.amu.opd.dto;

import com.amu.opd.entity.DiagnosticDiscipline;
import java.time.LocalDate;
import java.util.List;

public class ConsultationRequest {
    private Long appointmentId;
    private String symptoms;
    private String clinicalObservations;
    private String provisionalDiagnosis;
    private String finalDiagnosis;
    private LocalDate followUpDate;
    private String medicinesJson;
    private String generalAdvice;
    private List<DiagnosticOrderDto> diagnosticOrders;

    public static class DiagnosticOrderDto {
        private DiagnosticDiscipline discipline;
        private String testName;
        private String clinicalNotes;

        public DiagnosticDiscipline getDiscipline() { return discipline; }
        public void setDiscipline(DiagnosticDiscipline discipline) { this.discipline = discipline; }
        public String getTestName() { return testName; }
        public void setTestName(String testName) { this.testName = testName; }
        public String getClinicalNotes() { return clinicalNotes; }
        public void setClinicalNotes(String clinicalNotes) { this.clinicalNotes = clinicalNotes; }
    }

    public ConsultationRequest() {}

    public Long getAppointmentId() { return appointmentId; }
    public void setAppointmentId(Long appointmentId) { this.appointmentId = appointmentId; }
    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }
    public String getClinicalObservations() { return clinicalObservations; }
    public void setClinicalObservations(String clinicalObservations) { this.clinicalObservations = clinicalObservations; }
    public String getProvisionalDiagnosis() { return provisionalDiagnosis; }
    public void setProvisionalDiagnosis(String provisionalDiagnosis) { this.provisionalDiagnosis = provisionalDiagnosis; }
    public String getFinalDiagnosis() { return finalDiagnosis; }
    public void setFinalDiagnosis(String finalDiagnosis) { this.finalDiagnosis = finalDiagnosis; }
    public LocalDate getFollowUpDate() { return followUpDate; }
    public void setFollowUpDate(LocalDate followUpDate) { this.followUpDate = followUpDate; }
    public String getMedicinesJson() { return medicinesJson; }
    public void setMedicinesJson(String medicinesJson) { this.medicinesJson = medicinesJson; }
    public String getGeneralAdvice() { return generalAdvice; }
    public void setGeneralAdvice(String generalAdvice) { this.generalAdvice = generalAdvice; }
    public List<DiagnosticOrderDto> getDiagnosticOrders() { return diagnosticOrders; }
    public void setDiagnosticOrders(List<DiagnosticOrderDto> diagnosticOrders) { this.diagnosticOrders = diagnosticOrders; }
}
