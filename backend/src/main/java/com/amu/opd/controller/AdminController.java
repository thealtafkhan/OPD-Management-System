package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.entity.*;
import com.amu.opd.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private OpdTokenRepository tokenRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private DiagnosticRequestRepository diagnosticRequestRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPatients", patientRepository.count());
        stats.put("totalAppointments", appointmentRepository.count());
        stats.put("todayTokens", tokenRepository.findAll().stream().filter(t -> LocalDate.now().equals(t.getQueueDate())).count());
        stats.put("totalConsultations", consultationRepository.count());
        stats.put("pendingDiagnostics", diagnosticRequestRepository.count());
        stats.put("totalDepartments", departmentRepository.count());
        stats.put("totalDoctors", doctorRepository.count());
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats fetched", stats));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Departments", departmentRepository.findAll()));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<Department>> addDepartment(@RequestBody Department dept) {
        dept.setActive(true);
        return ResponseEntity.ok(ApiResponse.success("Department added", departmentRepository.save(dept)));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Doctors", doctorRepository.findAll()));
    }

    @PostMapping("/doctors")
    public ResponseEntity<ApiResponse<Doctor>> addDoctor(@RequestBody Doctor doc) {
        doc.setActive(true);
        return ResponseEntity.ok(ApiResponse.success("Doctor added", doctorRepository.save(doc)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<User>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users", userRepository.findAll()));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<User>> updateUserRole(@PathVariable Long userId, @RequestParam Role role) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        return ResponseEntity.ok(ApiResponse.success("Role updated", userRepository.save(user)));
    }
}
