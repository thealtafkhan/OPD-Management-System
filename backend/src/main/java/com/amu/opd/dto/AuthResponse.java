package com.amu.opd.dto;

import com.amu.opd.entity.Role;

public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private Role role;
    private Long userId;
    private String patientId; // Present if PATIENT
    private Long doctorId;   // Present if DOCTOR

    public AuthResponse() {}
    public AuthResponse(String token, String username, String fullName, Role role, Long userId, String patientId, Long doctorId) {
        this.token = token;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.userId = userId;
        this.patientId = patientId;
        this.doctorId = doctorId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
}
