package com.amu.opd.service;

import com.amu.opd.dto.AuthRequest;
import com.amu.opd.dto.AuthResponse;
import com.amu.opd.dto.RegisterPatientRequest;
import com.amu.opd.entity.*;
import com.amu.opd.repository.DoctorRepository;
import com.amu.opd.repository.PatientRepository;
import com.amu.opd.repository.UserRepository;
import com.amu.opd.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(AuthRequest request) {
        String identifier = request.getUsername();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());

        String patientId = null;
        if (user.getRole() == Role.PATIENT) {
            patientRepository.findByUser(user).ifPresent(p -> {});
            Optional<Patient> pOpt = patientRepository.findByUser(user);
            if (pOpt.isPresent()) {
                patientId = pOpt.get().getPatientId();
            }
        }

        Long doctorId = null;
        if (user.getRole() == Role.DOCTOR) {
            Optional<Doctor> dOpt = doctorRepository.findByUserId(user.getId());
            if (dOpt.isPresent()) {
                doctorId = dOpt.get().getId();
            }
        }

        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole(), user.getId(), patientId, doctorId);
    }

    @Transactional
    public AuthResponse registerPatient(RegisterPatientRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (request.getEmail() != null && !request.getEmail().isEmpty() && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getFullName(),
                request.getEmail(),
                request.getMobile(),
                Role.PATIENT
        );
        userRepository.save(user);

        // Generate persistent Patient ID e.g. PID-1001
        long count = patientRepository.count();
        String persistentPid = String.format("PID-%04d", 1001 + count);

        Patient patient = new Patient();
        patient.setPatientId(persistentPid);
        patient.setUser(user);
        patient.setFullName(request.getFullName());
        patient.setMobile(request.getMobile());
        patient.setAadhaarRef(request.getAadhaarRef());
        patient.setAbhaRef(request.getAbhaRef());
        patient.setDateOfBirth(request.getDateOfBirth() != null ? request.getDateOfBirth() : LocalDate.of(2000, 1, 1));
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setAffiliationType(request.getAffiliationType() != null ? request.getAffiliationType() : AffiliationType.NORMAL_CITIZEN);
        patient.setAmuIdCardUrl(request.getAmuIdCardUrl());
        patient.setAffiliationExpiryDate(request.getAffiliationExpiryDate());

        patientRepository.save(patient);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole(), user.getId());
        return new AuthResponse(token, user.getUsername(), user.getFullName(), user.getRole(), user.getId(), persistentPid, null);
    }
}
