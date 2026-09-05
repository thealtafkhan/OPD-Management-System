package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.dto.PediatricBookingRequest;
import com.amu.opd.entity.AffiliationType;
import com.amu.opd.entity.Appointment;
import com.amu.opd.entity.Patient;
import com.amu.opd.entity.User;
import com.amu.opd.repository.PatientRepository;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.service.ClinicalService;
import com.amu.opd.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/patient")
@CrossOrigin(origins = "*")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private ClinicalService clinicalService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Patient>> getMyProfile(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient patient = patientService.getPatientByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Patient profile fetched", patient));
    }

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<Patient>>> getMyChildren(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Patient guardian = patientService.getPatientByUserId(user.getId());
        List<Patient> children = patientService.getLinkedPediatricChildren(guardian.getPatientId());
        return ResponseEntity.ok(ApiResponse.success("Children fetched", children));
    }

    @PostMapping("/pediatric-booking")
    public ResponseEntity<ApiResponse<Appointment>> bookPediatricAppointment(@RequestBody PediatricBookingRequest request) {
        Appointment appt = patientService.bookPediatricAppointment(request);
        return ResponseEntity.ok(ApiResponse.success("Pediatric booking initiated. Please proceed to payment.", appt));
    }

    @GetMapping("/ehr/{patientId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLongitudinalEhr(@PathVariable String patientId) {
        Map<String, Object> ehr = clinicalService.getPatientEhrHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success("Longitudinal EHR fetched", ehr));
    }

    @PostMapping("/reactivate-affiliation")
    public ResponseEntity<ApiResponse<Patient>> reactivateAffiliation(
            @RequestParam String patientId,
            @RequestParam AffiliationType affiliationType,
            @RequestParam(required = false) String idCardUrl,
            @RequestParam String newExpiryDate) {
        LocalDate expiry = LocalDate.parse(newExpiryDate);
        Patient updated = patientService.reactivateAffiliation(patientId, affiliationType, idCardUrl, expiry);
        return ResponseEntity.ok(ApiResponse.success("Affiliation reactivated successfully", updated));
    }
}
