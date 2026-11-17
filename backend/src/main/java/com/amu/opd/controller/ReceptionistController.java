package com.amu.opd.controller;

import com.amu.opd.dto.ApiResponse;
import com.amu.opd.dto.AppointmentRequest;
import com.amu.opd.dto.PaymentProcessRequest;
import com.amu.opd.dto.RegisterPatientRequest;
import com.amu.opd.entity.*;
import com.amu.opd.repository.AppointmentRepository;
import com.amu.opd.repository.OpdTokenRepository;
import com.amu.opd.service.AppointmentService;
import com.amu.opd.service.AuthService;
import com.amu.opd.service.QueueSchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/receptionist")
@CrossOrigin(origins = "*")
public class ReceptionistController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private QueueSchedulerService queueSchedulerService;

    @Autowired
    private OpdTokenRepository tokenRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @PostMapping("/register-walkin")
    public ResponseEntity<ApiResponse<Map<String, Object>>> registerWalkin(@RequestBody RegisterPatientRequest request) {
        var authRes = authService.registerPatient(request);
        Map<String, Object> resp = new HashMap<>();
        resp.put("patientId", authRes.getPatientId());
        resp.put("fullName", authRes.getFullName());
        resp.put("email", authRes.getUsername());
        resp.put("affiliationType", request.getAffiliationType());
        return ResponseEntity.ok(ApiResponse.success("Walk-in Patient registered free of charge! Patient ID: " + authRes.getPatientId(), resp));
    }

    @PostMapping("/book-and-token")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bookAndIssueToken(@RequestBody AppointmentRequest request, java.security.Principal principal) {
        Appointment appt = appointmentService.bookAppointment(request);

        // Immediate On-Counter Payment Confirmation
        PaymentProcessRequest payReq = new PaymentProcessRequest();
        payReq.setAppointmentId(appt.getId());
        payReq.setPaymentMethod("CASH");
        payReq.setSimulateSuccess(true);
        Appointment settledAppt = appointmentService.processPayment(payReq);

        // Mark slip as verified & issued immediately at walk-in counter
        settledAppt.setSlipIssued(true);
        settledAppt.setSlipIssuedAt(java.time.LocalDateTime.now());
        settledAppt.setVerifiedBy(principal != null ? principal.getName() : "receptionist");
        appointmentRepository.save(settledAppt);

        OpdToken token = tokenRepository.findByAppointmentId(settledAppt.getId())
                .orElseThrow(() -> new RuntimeException("Token generation failed"));

        Map<String, Object> result = new HashMap<>();
        result.put("appointment", settledAppt);
        result.put("token", token);

        return ResponseEntity.ok(ApiResponse.success("Token " + token.getTokenNumber() + " issued & Prescription Slip printed for Dr. " + token.getDoctor().getUser().getFullName() + " (Room " + token.getDoctor().getRoomNumber() + ")", result));
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String date) {
        
        List<Appointment> appointments;
        if (date != null && !date.trim().isEmpty()) {
            appointments = appointmentRepository.findByAppointmentDateOrderByCreatedAtDesc(LocalDate.parse(date.trim()));
        } else {
            appointments = appointmentRepository.findAllByOrderByCreatedAtDesc();
        }

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            appointments = appointments.stream().filter(a -> 
                (a.getPatient() != null && (
                    (a.getPatient().getPatientId() != null && a.getPatient().getPatientId().toLowerCase().contains(q)) ||
                    (a.getPatient().getFullName() != null && a.getPatient().getFullName().toLowerCase().contains(q)) ||
                    (a.getPatient().getMobile() != null && a.getPatient().getMobile().contains(q))
                )) ||
                (a.getAppointmentNumber() != null && a.getAppointmentNumber().toLowerCase().contains(q))
            ).collect(java.util.stream.Collectors.toList());
        }

        List<Map<String, Object>> result = appointments.stream().map(a -> {
            Map<String, Object> item = new HashMap<>();
            item.put("appointment", a);
            tokenRepository.findByAppointmentId(a.getId()).ifPresent(tok -> item.put("token", tok));
            return item;
        }).collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Bookings fetched", result));
    }

    @PostMapping("/verify-and-issue-slip/{appointmentId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyAndIssueSlip(
            @PathVariable Long appointmentId,
            java.security.Principal principal) {
        
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + appointmentId));

        // If payment was pending, confirm it (e.g. cash on desk)
        if (appt.getPaymentState() != PaymentState.SUCCESSFUL) {
            PaymentProcessRequest payReq = new PaymentProcessRequest();
            payReq.setAppointmentId(appt.getId());
            payReq.setPaymentMethod("CASH");
            payReq.setSimulateSuccess(true);
            appt = appointmentService.processPayment(payReq);
        }

        // Mark Slip as officially verified and issued
        appt.setSlipIssued(true);
        appt.setSlipIssuedAt(java.time.LocalDateTime.now());
        appt.setVerifiedBy(principal != null ? principal.getName() : "receptionist");
        Appointment savedAppt = appointmentRepository.save(appt);

        // Fetch or generate Token
        OpdToken token = tokenRepository.findByAppointmentId(savedAppt.getId())
                .orElseGet(() -> queueSchedulerService.generateTokenForAppointment(savedAppt));

        Map<String, Object> result = new HashMap<>();
        result.put("appointment", savedAppt);
        result.put("token", token);
        result.put("message", "Patient verified successfully! OPD Prescription Slip ready for hand-over.");

        return ResponseEntity.ok(ApiResponse.success("Patient " + savedAppt.getPatient().getFullName() + " (PID: " + savedAppt.getPatient().getPatientId() + ") verified. OPD Prescription & Consultation slip generated.", result));
    }

    @GetMapping("/today-tokens")
    public ResponseEntity<ApiResponse<List<OpdToken>>> getTodayTokens() {
        List<OpdToken> tokens = tokenRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Today tokens fetched", tokens));
    }
}
