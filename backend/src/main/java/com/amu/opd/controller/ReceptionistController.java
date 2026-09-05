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
    public ResponseEntity<ApiResponse<Map<String, Object>>> bookAndIssueToken(@RequestBody AppointmentRequest request) {
        Appointment appt = appointmentService.bookAppointment(request);

        // Immediate On-Counter Payment Confirmation
        PaymentProcessRequest payReq = new PaymentProcessRequest();
        payReq.setAppointmentId(appt.getId());
        payReq.setPaymentMethod("CASH");
        payReq.setSimulateSuccess(true);
        Appointment settledAppt = appointmentService.processPayment(payReq);

        OpdToken token = tokenRepository.findByAppointmentId(settledAppt.getId())
                .orElseThrow(() -> new RuntimeException("Token generation failed"));

        Map<String, Object> result = new HashMap<>();
        result.put("appointment", settledAppt);
        result.put("token", token);

        return ResponseEntity.ok(ApiResponse.success("Token " + token.getTokenNumber() + " issued for Dr. " + token.getDoctor().getUser().getFullName() + " (Room " + token.getDoctor().getRoomNumber() + ")", result));
    }

    @GetMapping("/today-tokens")
    public ResponseEntity<ApiResponse<List<OpdToken>>> getTodayTokens() {
        List<OpdToken> tokens = tokenRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Today tokens fetched", tokens));
    }
}
