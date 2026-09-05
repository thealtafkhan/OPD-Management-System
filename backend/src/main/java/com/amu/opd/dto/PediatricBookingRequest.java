package com.amu.opd.dto;

import java.time.LocalDate;

public class PediatricBookingRequest {
    private String guardianPatientId; // e.g. PID-1001
    private String childFullName;
    private LocalDate childDateOfBirth; // Must be <= 8 years
    private String childGender;
    private String childBloodGroup;
    private String guardianRelation; // Father, Mother, Uncle, Grandparent
    private String aadhaarRef;
    private String abhaRef;

    private Long departmentId;
    private Long doctorId;
    private LocalDate appointmentDate;
    private String timeSlot;

    public PediatricBookingRequest() {}

    public String getGuardianPatientId() { return guardianPatientId; }
    public void setGuardianPatientId(String guardianPatientId) { this.guardianPatientId = guardianPatientId; }
    public String getChildFullName() { return childFullName; }
    public void setChildFullName(String childFullName) { this.childFullName = childFullName; }
    public LocalDate getChildDateOfBirth() { return childDateOfBirth; }
    public void setChildDateOfBirth(LocalDate childDateOfBirth) { this.childDateOfBirth = childDateOfBirth; }
    public String getChildGender() { return childGender; }
    public void setChildGender(String childGender) { this.childGender = childGender; }
    public String getChildBloodGroup() { return childBloodGroup; }
    public void setChildBloodGroup(String childBloodGroup) { this.childBloodGroup = childBloodGroup; }
    public String getGuardianRelation() { return guardianRelation; }
    public void setGuardianRelation(String guardianRelation) { this.guardianRelation = guardianRelation; }
    public String getAadhaarRef() { return aadhaarRef; }
    public void setAadhaarRef(String aadhaarRef) { this.aadhaarRef = aadhaarRef; }
    public String getAbhaRef() { return abhaRef; }
    public void setAbhaRef(String abhaRef) { this.abhaRef = abhaRef; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
}
