package com.amu.opd.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "opd_tokens")
public class OpdToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String tokenNumber; // N-001, S-001, E-001

    private String tokenPrefix; // N, S, E
    private Integer tokenSequence;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private LocalDate queueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TokenStatus status = TokenStatus.WAITING;

    private int priorityWeight = 0; // Higher = served sooner (AMU affiliates have priority)
    private LocalDateTime tokenIssuedAt = LocalDateTime.now();
    private LocalDateTime consultationStartedAt;
    private LocalDateTime consultationCompletedAt;

    public OpdToken() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTokenNumber() { return tokenNumber; }
    public void setTokenNumber(String tokenNumber) { this.tokenNumber = tokenNumber; }
    public String getTokenPrefix() { return tokenPrefix; }
    public void setTokenPrefix(String tokenPrefix) { this.tokenPrefix = tokenPrefix; }
    public Integer getTokenSequence() { return tokenSequence; }
    public void setTokenSequence(Integer tokenSequence) { this.tokenSequence = tokenSequence; }
    public Appointment getAppointment() { return appointment; }
    public void setAppointment(Appointment appointment) { this.appointment = appointment; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public LocalDate getQueueDate() { return queueDate; }
    public void setQueueDate(LocalDate queueDate) { this.queueDate = queueDate; }
    public TokenStatus getStatus() { return status; }
    public void setStatus(TokenStatus status) { this.status = status; }
    public int getPriorityWeight() { return priorityWeight; }
    public void setPriorityWeight(int priorityWeight) { this.priorityWeight = priorityWeight; }
    public LocalDateTime getTokenIssuedAt() { return tokenIssuedAt; }
    public void setTokenIssuedAt(LocalDateTime tokenIssuedAt) { this.tokenIssuedAt = tokenIssuedAt; }
    public LocalDateTime getConsultationStartedAt() { return consultationStartedAt; }
    public void setConsultationStartedAt(LocalDateTime consultationStartedAt) { this.consultationStartedAt = consultationStartedAt; }
    public LocalDateTime getConsultationCompletedAt() { return consultationCompletedAt; }
    public void setConsultationCompletedAt(LocalDateTime consultationCompletedAt) { this.consultationCompletedAt = consultationCompletedAt; }
}
