package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.dto.AuthRequest;
import com.amu.opd.dto.AuthResponse;
import com.amu.opd.dto.RegisterPatientRequest;
import com.amu.opd.entity.Doctor;
import com.amu.opd.entity.Patient;
import com.amu.opd.entity.User;
import com.amu.opd.repository.DoctorRepository;
import com.amu.opd.repository.PatientRepository;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterPatientRequest request) {
        try {
            AuthResponse response = authService.registerPatient(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful! Free Patient ID assigned.", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody AuthRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Not authenticated"));
        }
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("email", user.getEmail());
        data.put("fullName", user.getFullName());
        data.put("role", user.getRole());
        data.put("phoneNumber", user.getMobile());

        patientRepository.findByUserId(user.getId()).ifPresent(p -> {
            data.put("patientId", p.getPatientId());
            data.put("patient", p);
        });

        doctorRepository.findByUserId(user.getId()).ifPresent(d -> {
            data.put("doctorId", d.getId());
            data.put("doctor", d);
        });

        return ResponseEntity.ok(ApiResponse.success("User profile fetched", data));
    }
}
