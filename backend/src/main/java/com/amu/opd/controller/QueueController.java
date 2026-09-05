package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.entity.OpdToken;
import com.amu.opd.entity.TokenStatus;
import com.amu.opd.repository.OpdTokenRepository;
import com.amu.opd.service.QueueSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {

    @Autowired
    private QueueSchedulerService queueSchedulerService;

    @Autowired
    private OpdTokenRepository tokenRepository;

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<OpdToken>>> getDoctorQueue(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String date) {
        LocalDate qDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        List<OpdToken> tokens = queueSchedulerService.getDoctorLiveQueue(doctorId, qDate);
        return ResponseEntity.ok(ApiResponse.success("Live queue fetched", tokens));
    }

    @PostMapping("/doctor/{doctorId}/call-next")
    public ResponseEntity<ApiResponse<OpdToken>> callNextPatient(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String date) {
        LocalDate qDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        OpdToken token = queueSchedulerService.callNextPatient(doctorId, qDate);
        if (token == null) {
            return ResponseEntity.ok(ApiResponse.error("No waiting patients in queue for this doctor."));
        }
        return ResponseEntity.ok(ApiResponse.success("Token " + token.getTokenNumber() + " called for consultation.", token));
    }

    @PostMapping("/complete/{tokenId}")
    public ResponseEntity<ApiResponse<OpdToken>> completeToken(@PathVariable Long tokenId) {
        OpdToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        token.setStatus(TokenStatus.COMPLETED);
        token.setConsultationCompletedAt(LocalDateTime.now());
        OpdToken saved = tokenRepository.save(token);
        return ResponseEntity.ok(ApiResponse.success("Token marked completed", saved));
    }

    @PostMapping("/skip/{tokenId}")
    public ResponseEntity<ApiResponse<OpdToken>> skipToken(@PathVariable Long tokenId) {
        OpdToken token = tokenRepository.findById(tokenId)
                .orElseThrow(() -> new RuntimeException("Token not found"));
        token.setStatus(TokenStatus.SKIPPED);
        OpdToken saved = tokenRepository.save(token);
        return ResponseEntity.ok(ApiResponse.success("Token marked skipped", saved));
    }

    @GetMapping("/lobby")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLobbyDisplay(
            @RequestParam(required = false) String date) {
        LocalDate qDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        List<Map<String, Object>> display = queueSchedulerService.getPublicLobbyDisplay(qDate);
        return ResponseEntity.ok(ApiResponse.success("Public lobby display data fetched", display));
    }
}
