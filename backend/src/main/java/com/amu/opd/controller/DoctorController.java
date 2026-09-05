package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.dto.ConsultationRequest;
import com.amu.opd.entity.Consultation;
import com.amu.opd.entity.Doctor;
import com.amu.opd.entity.OpdToken;
import com.amu.opd.entity.TokenStatus;
import com.amu.opd.entity.User;
import com.amu.opd.repository.DoctorRepository;
import com.amu.opd.repository.OpdTokenRepository;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.service.ClinicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "*")
public class DoctorController {

    @Autowired
    private ClinicalService clinicalService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OpdTokenRepository tokenRepository;

    @GetMapping("/my-profile")
    public ResponseEntity<ApiResponse<Doctor>> getMyDoctorProfile(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doc = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));
        return ResponseEntity.ok(ApiResponse.success("Doctor profile fetched", doc));
    }

    @GetMapping("/active-token")
    public ResponseEntity<ApiResponse<OpdToken>> getCurrentlyServingToken(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        Doctor doc = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Doctor profile not found"));

        Optional<OpdToken> active = tokenRepository.findByDoctorIdAndQueueDateAndStatus(doc.getId(), LocalDate.now(), TokenStatus.IN_CONSULTATION);
        return ResponseEntity.ok(ApiResponse.success("Active token", active.orElse(null)));
    }

    @PostMapping("/consultation")
    public ResponseEntity<ApiResponse<Consultation>> saveConsultation(@RequestBody ConsultationRequest request) {
        Consultation consultation = clinicalService.recordConsultation(request);
        return ResponseEntity.ok(ApiResponse.success("Consultation notes, prescription, and diagnostic orders recorded successfully!", consultation));
    }

    @GetMapping("/history/{patientId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPatientEhr(@PathVariable String patientId) {
        Map<String, Object> ehr = clinicalService.getPatientEhrHistory(patientId);
        return ResponseEntity.ok(ApiResponse.success("Patient longitudinal EHR fetched", ehr));
    }
}
