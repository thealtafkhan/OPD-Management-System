package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.entity.Department;
import com.amu.opd.entity.Doctor;
import com.amu.opd.entity.Notification;
import com.amu.opd.entity.User;
import com.amu.opd.repository.DepartmentRepository;
import com.amu.opd.repository.DoctorRepository;
import com.amu.opd.repository.NotificationRepository;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.service.QueueSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "*")
public class PublicController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private QueueSchedulerService queueSchedulerService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getActiveDepartments() {
        return ResponseEntity.ok(ApiResponse.success("Active departments", departmentRepository.findAllByActiveTrue()));
    }

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse<List<Doctor>>> getActiveDoctors() {
        return ResponseEntity.ok(ApiResponse.success("Active doctors", doctorRepository.findAllByActiveTrue()));
    }

    @GetMapping("/lobby-board")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLobbyBoard(
            @RequestParam(required = false) String date) {
        LocalDate qDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        List<Map<String, Object>> display = queueSchedulerService.getPublicLobbyDisplay(qDate);
        return ResponseEntity.ok(ApiResponse.success("Live waiting lobby board data", display));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Notification>>> getMyNotifications(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok(ApiResponse.success("No notifications", List.of()));
        }
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName())).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success("No notifications", List.of()));
        }
        return ResponseEntity.ok(ApiResponse.success("Notifications", notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())));
    }
}
