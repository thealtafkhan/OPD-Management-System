package com.amu.opd.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String patientId; // Persistent Patient ID e.g. PID-1001

    @OneToOne
    @JoinColumn(name = "user_id", nullable = true)
    private User user; // Nullable for pediatric children booked under guardian

    @Column(nullable = false)
    private String fullName;

    private String mobile;
    private String aadhaarRef;
    private String abhaRef;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    private String gender;
    private String bloodGroup;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AffiliationType affiliationType; // NORMAL_CITIZEN, AMU_STUDENT, AMU_EMPLOYEE

    private String amuIdCardUrl; // Uploaded ID proof
    private LocalDate affiliationExpiryDate; // Validity of student course / employee tenure

    private String guardianPatientId; // If pediatric child, links to guardian's PID
    private String guardianRelation; // father, mother, uncle, grandparent, etc.

    private LocalDateTime createdAt = LocalDateTime.now();

    public Patient() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getAadhaarRef() { return aadhaarRef; }
    public void setAadhaarRef(String aadhaarRef) { this.aadhaarRef = aadhaarRef; }
    public String getAbhaRef() { return abhaRef; }
    public void setAbhaRef(String abhaRef) { this.abhaRef = abhaRef; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public AffiliationType getAffiliationType() { return affiliationType; }
    public void setAffiliationType(AffiliationType affiliationType) { this.affiliationType = affiliationType; }
    public String getAmuIdCardUrl() { return amuIdCardUrl; }
    public void setAmuIdCardUrl(String amuIdCardUrl) { this.amuIdCardUrl = amuIdCardUrl; }
    public LocalDate getAffiliationExpiryDate() { return affiliationExpiryDate; }
    public void setAffiliationExpiryDate(LocalDate affiliationExpiryDate) { this.affiliationExpiryDate = affiliationExpiryDate; }
    public String getGuardianPatientId() { return guardianPatientId; }
    public void setGuardianPatientId(String guardianPatientId) { this.guardianPatientId = guardianPatientId; }
    public String getGuardianRelation() { return guardianRelation; }
    public void setGuardianRelation(String guardianRelation) { this.guardianRelation = guardianRelation; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
