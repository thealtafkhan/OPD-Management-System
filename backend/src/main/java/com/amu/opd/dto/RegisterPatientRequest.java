package com.amu.opd.dto;

import com.amu.opd.entity.AffiliationType;
import java.time.LocalDate;

public class RegisterPatientRequest {
    private String username;
    private String password;
    private String fullName;
    private String email;
    private String mobile;
    private String aadhaarRef;
    private String abhaRef;
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private AffiliationType affiliationType;
    private String amuIdCardUrl;
    private LocalDate affiliationExpiryDate;

    public RegisterPatientRequest() {}

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
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
}
