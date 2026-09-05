package com.amu.opd.service;

import com.amu.opd.dto.PediatricBookingRequest;
import com.amu.opd.entity.*;
import com.amu.opd.repository.*;
import com.amu.opd.util.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private NotificationService notificationService;

    public Patient getPatientByPatientId(String patientId) {
        return patientRepository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Patient record not found: " + patientId));
    }

    public Patient getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Patient record not found for user: " + userId));
    }

    public List<Patient> getLinkedPediatricChildren(String guardianPatientId) {
        return patientRepository.findByGuardianPatientId(guardianPatientId);
    }

    /**
     * Checks whether an institutional affiliation is active for a given date.
     * If expired, returns NORMAL_CITIZEN for current visit priority while retaining persistent Patient ID.
     */
    public AffiliationType getEffectiveAffiliation(Patient patient, LocalDate visitDate) {
        if (patient.getAffiliationType() == AffiliationType.NORMAL_CITIZEN) {
            return AffiliationType.NORMAL_CITIZEN;
        }

        if (patient.getAffiliationExpiryDate() == null) {
            return patient.getAffiliationType();
        }

        if (patient.getAffiliationExpiryDate().isBefore(visitDate)) {
            // Expired: Treated as normal citizen for this visit
            return AffiliationType.NORMAL_CITIZEN;
        }

        return patient.getAffiliationType();
    }

    @Transactional
    public Patient reactivateAffiliation(String patientId, AffiliationType newType, String idCardUrl, LocalDate newExpiryDate) {
        Patient patient = getPatientByPatientId(patientId);
        patient.setAffiliationType(newType);
        patient.setAmuIdCardUrl(idCardUrl);
        patient.setAffiliationExpiryDate(newExpiryDate);
        return patientRepository.save(patient);
    }

    /**
     * Registered user can book an appointment on behalf of a child who is 8 years of age or below.
     * Creates separate Patient record/ID linked to guardian.
     */
    @Transactional
    public Appointment bookPediatricAppointment(PediatricBookingRequest request) {
        Patient guardian = getPatientByPatientId(request.getGuardianPatientId());

        // Validate child age <= 8 years
        if (request.getChildDateOfBirth() == null) {
            throw new RuntimeException("Child date of birth is required");
        }
        int age = Period.between(request.getChildDateOfBirth(), LocalDate.now()).getYears();
        if (age > 8) {
            throw new RuntimeException("Child eligibility requires age 8 years or below. Current age: " + age + " years.");
        }

        // Check if child record already exists under this guardian with same name and DOB to prevent duplicate records
        List<Patient> existingChildren = patientRepository.findByGuardianPatientId(guardian.getPatientId());
        Patient childPatient = null;
        for (Patient c : existingChildren) {
            if (c.getFullName().equalsIgnoreCase(request.getChildFullName()) && c.getDateOfBirth().equals(request.getChildDateOfBirth())) {
                childPatient = c;
                break;
            }
        }

        if (childPatient == null) {
            long count = patientRepository.count();
            String childPid = String.format("PID-%04d", 1001 + count);

            childPatient = new Patient();
            childPatient.setPatientId(childPid);
            childPatient.setUser(null); // No separate login credentials
            childPatient.setFullName(request.getChildFullName());
            childPatient.setDateOfBirth(request.getChildDateOfBirth());
            childPatient.setGender(request.getChildGender());
            childPatient.setBloodGroup(request.getChildBloodGroup());
            childPatient.setGuardianPatientId(guardian.getPatientId());
            childPatient.setGuardianRelation(request.getGuardianRelation() != null ? request.getGuardianRelation() : "Guardian");
            childPatient.setAadhaarRef(request.getAadhaarRef());
            childPatient.setAbhaRef(request.getAbhaRef());
            childPatient.setAffiliationType(AffiliationType.NORMAL_CITIZEN); // Child does not automatically inherit AMU priority unless specified
            childPatient = patientRepository.save(childPatient);
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setAppointmentNumber(IdGenerator.generateAppointmentNumber());
        appointment.setPatient(childPatient);
        appointment.setDoctor(doctor);
        appointment.setDepartment(department);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());
        appointment.setFeeAmount(doctor.getConsultationFee() != null ? doctor.getConsultationFee() : new BigDecimal("50.00"));
        appointment.setPaymentState(PaymentState.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        if (guardian.getUser() != null) {
            notificationService.sendNotification(
                    guardian.getUser(),
                    "Pediatric Booking Initiated",
                    "Appointment " + saved.getAppointmentNumber() + " created for " + childPatient.getFullName() + ". Please complete the fee payment to confirm token.",
                    "APPOINTMENT"
            );
        }

        return saved;
    }
}
