package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.dto.DiagnosticUploadRequest;
import com.amu.opd.entity.DiagnosticDiscipline;
import com.amu.opd.entity.DiagnosticReport;
import com.amu.opd.entity.DiagnosticRequest;
import com.amu.opd.entity.User;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.service.DiagnosticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/diagnostic")
@CrossOrigin(origins = "*")
public class DiagnosticController {

    @Autowired
    private DiagnosticService diagnosticService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/disciplines")
    public ResponseEntity<ApiResponse<List<DiagnosticDiscipline>>> getDisciplines() {
        return ResponseEntity.ok(ApiResponse.success("Disciplines", Arrays.asList(DiagnosticDiscipline.values())));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<DiagnosticRequest>>> getRequests(
            @RequestParam(required = false) DiagnosticDiscipline discipline) {
        List<DiagnosticRequest> list = diagnosticService.getPendingRequests(discipline);
        return ResponseEntity.ok(ApiResponse.success("Diagnostic requests fetched", list));
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<DiagnosticReport>> uploadReport(
            @RequestBody DiagnosticUploadRequest request,
            Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));
        DiagnosticReport report = diagnosticService.uploadReport(request, user.getId());
        String msg = report.isFinalized()
                ? "Diagnostic report finalized and locked against further modification."
                : "Diagnostic report draft saved successfully.";
        return ResponseEntity.ok(ApiResponse.success(msg, report));
    }
}
