package com.amu.opd.service;

import com.amu.opd.dto.ConsultationRequest;
import com.amu.opd.entity.*;
import com.amu.opd.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ClinicalService {

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private DiagnosticRequestRepository diagnosticRequestRepository;

    @Autowired
    private DiagnosticReportRepository diagnosticReportRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private OpdTokenRepository tokenRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Consultation recordConsultation(ConsultationRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        Consultation consultation = new Consultation();
        consultation.setAppointment(appointment);
        consultation.setPatient(appointment.getPatient());
        consultation.setDoctor(appointment.getDoctor());
        consultation.setVisitDate(LocalDate.now());
        consultation.setSymptoms(request.getSymptoms());
        consultation.setClinicalObservations(request.getClinicalObservations());
        consultation.setProvisionalDiagnosis(request.getProvisionalDiagnosis());
        consultation.setFinalDiagnosis(request.getFinalDiagnosis());
        consultation.setFollowUpDate(request.getFollowUpDate());

        Consultation savedConsultation = consultationRepository.save(consultation);

        // Save Digital Prescription if medicines provided
        if (request.getMedicinesJson() != null && !request.getMedicinesJson().trim().isEmpty()) {
            Prescription prescription = new Prescription();
            prescription.setConsultation(savedConsultation);
            prescription.setPatient(appointment.getPatient());
            prescription.setDoctor(appointment.getDoctor());
            prescription.setMedicinesJson(request.getMedicinesJson());
            prescription.setGeneralAdvice(request.getGeneralAdvice());
            prescriptionRepository.save(prescription);
        }

        // Save Diagnostic Requests across Blood/Laboratory, X-Ray, Ultrasound
        if (request.getDiagnosticOrders() != null) {
            for (ConsultationRequest.DiagnosticOrderDto order : request.getDiagnosticOrders()) {
                if (order.getTestName() != null && !order.getTestName().trim().isEmpty()) {
                    DiagnosticRequest diagReq = new DiagnosticRequest();
                    diagReq.setConsultation(savedConsultation);
                    diagReq.setPatient(appointment.getPatient());
                    diagReq.setDoctor(appointment.getDoctor());
                    diagReq.setDiscipline(order.getDiscipline());
                    diagReq.setTestName(order.getTestName());
                    diagReq.setClinicalNotes(order.getClinicalNotes());
                    diagReq.setStatus(DiagnosticStatus.ORDERED);
                    diagnosticRequestRepository.save(diagReq);
                }
            }
        }

        // Mark OPD Token as completed
        tokenRepository.findByAppointmentId(appointment.getId()).ifPresent(token -> {
            token.setStatus(TokenStatus.COMPLETED);
            token.setConsultationCompletedAt(LocalDateTime.now());
            tokenRepository.save(token);
        });

        // Mark Appointment completed
        appointment.setStatus("COMPLETED");
        appointmentRepository.save(appointment);

        if (appointment.getPatient().getUser() != null) {
            notificationService.sendNotification(
                    appointment.getPatient().getUser(),
                    "Consultation Completed & Prescription Ready",
                    "Your consultation with Dr. " + appointment.getDoctor().getUser().getFullName() + " has completed. You can view or print your digital prescription on your portal.",
                    "REPORT"
            );
        }

        return savedConsultation;
    }

    /**
     * Retrieves the complete longitudinal Electronic Health Record (EHR) under persistent Patient ID.
     */
    public Map<String, Object> getPatientEhrHistory(String patientId) {
        Patient patient = patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Patient record not found"));

        List<Consultation> consultations = consultationRepository.findByPatientIdOrderByVisitDateDesc(patient.getId());
        List<Prescription> prescriptions = prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        List<DiagnosticRequest> diagnosticRequests = diagnosticRequestRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId());
        List<Appointment> appointments = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patient.getId());

        // Gather diagnostic reports linked to requests
        List<Map<String, Object>> reportsWithMeta = new ArrayList<>();
        for (DiagnosticRequest req : diagnosticRequests) {
            Map<String, Object> reqMap = new HashMap<>();
            reqMap.put("request", req);
            Optional<DiagnosticReport> repOpt = diagnosticReportRepository.findByDiagnosticRequestId(req.getId());
            reqMap.put("report", repOpt.orElse(null));
            reportsWithMeta.add(reqMap);
        }

        Map<String, Object> ehr = new HashMap<>();
        ehr.put("patient", patient);
        ehr.put("consultations", consultations);
        ehr.put("prescriptions", prescriptions);
        ehr.put("diagnosticRequests", reportsWithMeta);
        ehr.put("appointments", appointments);

        return ehr;
    }
}
