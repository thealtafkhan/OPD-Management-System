package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.dto.AppointmentRequest;
import com.amu.opd.dto.PaymentProcessRequest;
import com.amu.opd.entity.Appointment;
import com.amu.opd.entity.Doctor;
import com.amu.opd.entity.Patient;
import com.amu.opd.entity.User;
import com.amu.opd.repository.AppointmentRepository;
import com.amu.opd.repository.DoctorRepository;
import com.amu.opd.repository.PatientRepository;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @PostMapping("/book")
    public ResponseEntity<ApiResponse<Appointment>> bookAppointment(@RequestBody AppointmentRequest request) {
        Appointment appointment = appointmentService.bookAppointment(request);
        return ResponseEntity.ok(ApiResponse.success("Appointment created with status PENDING. Complete payment to issue token.", appointment));
    }

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<Appointment>> processPayment(@RequestBody PaymentProcessRequest request) {
        Appointment updated = appointmentService.processPayment(request);
        if (updated.getPaymentState().name().equals("SUCCESSFUL")) {
            return ResponseEntity.ok(ApiResponse.success("Payment verified! OPD Token issued successfully.", updated));
        } else {
            return ResponseEntity.ok(ApiResponse.error("Payment failed. Please retry payment."));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Appointment>>> getMyAppointments(Authentication authentication) {
        User user = userRepository.findByUsername(authentication.getName()).or(() -> userRepository.findByEmail(authentication.getName()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (patientRepository.findByUserId(user.getId()).isPresent()) {
            Patient p = patientRepository.findByUserId(user.getId()).get();
            List<Appointment> list = appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(p.getId());
            return ResponseEntity.ok(ApiResponse.success("Appointments fetched", list));
        } else if (doctorRepository.findByUserId(user.getId()).isPresent()) {
            Doctor d = doctorRepository.findByUserId(user.getId()).get();
            List<Appointment> list = appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(d.getId());
            return ResponseEntity.ok(ApiResponse.success("Doctor appointments fetched", list));
        }

        return ResponseEntity.ok(ApiResponse.success("No appointments found", List.of()));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<Appointment>>> getDoctorAppointments(
            @PathVariable Long doctorId,
            @RequestParam(required = false) String date) {
        LocalDate queryDate = (date != null) ? LocalDate.parse(date) : LocalDate.now();
        List<Appointment> list = appointmentService.getDoctorAppointmentsForDate(doctorId, queryDate);
        return ResponseEntity.ok(ApiResponse.success("Doctor appointments fetched", list));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Appointment>>> getAllAppointments() {
        return ResponseEntity.ok(ApiResponse.success("All appointments fetched", appointmentRepository.findAll()));
    }
}
