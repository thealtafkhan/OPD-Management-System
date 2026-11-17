package com.amu.opd.service;

import com.amu.opd.entity.*;
import com.amu.opd.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DataInitializerService implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private OpdTokenRepository tokenRepository;

    @Autowired
    private ConsultationRepository consultationRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already initialized
        }

        System.out.println("Initializing OPD Management System seed data...");

        // 1. Admin
        User admin = new User("admin", passwordEncoder.encode("admin123"), "System Administrator", "admin@amu.ac.in", "9876543210", Role.ADMIN);
        userRepository.save(admin);

        // 2. Receptionist
        User receptionist = new User("receptionist", passwordEncoder.encode("rec123"), "Farhan Akhtar (Reception)", "reception@amu.ac.in", "9876543211", Role.RECEPTIONIST);
        userRepository.save(receptionist);

        

        // 4. OPD Departments
        Department depMed = departmentRepository.save(new Department("General Medicine", "Primary outpatient adult care and diagnostic medicine", "Ground Floor, Wing A", "Room 101 - 105"));
        Department depPed = departmentRepository.save(new Department("Pediatrics", "Specialized healthcare for infants, children, and adolescents", "First Floor, Wing B", "Room 201 - 204"));
        Department depOrtho = departmentRepository.save(new Department("Orthopedics", "Bone, joint, and musculoskeletal system disorders", "Ground Floor, Wing C", "Room 110 - 114"));
        Department depEye = departmentRepository.save(new Department("Ophthalmology", "Eye care, vision testing, and ocular health", "Second Floor, Wing A", "Room 301 - 303"));

        // 5. Doctors
        User docUser1 = userRepository.save(new User("doc_ahmed", passwordEncoder.encode("doc123"), "Prof. Zameer Ahmed", "zahmed@amu.ac.in", "9876543220", Role.DOCTOR));
        Doctor doc1 = new Doctor();
        doc1.setUser(docUser1);
        doc1.setDepartment(depMed);
        doc1.setSpecialization("Senior Physician / Internal Medicine");
        doc1.setQualification("MBBS, MD (Medicine)");
        doc1.setRoomNumber("Room 102");
        doc1.setConsultationFee(new BigDecimal("50.00"));
        doc1.setAvailableDays("Mon, Tue, Wed, Thu, Fri, Sat");
        doc1.setAvailableTimeSlot("09:00 AM - 01:00 PM");
        doctorRepository.save(doc1);

        User docUser2 = userRepository.save(new User("doc_fatima", passwordEncoder.encode("doc123"), "Dr. Fatima Zahra", "fzahra@amu.ac.in", "9876543221", Role.DOCTOR));
        Doctor doc2 = new Doctor();
        doc2.setUser(docUser2);
        doc2.setDepartment(depPed);
        doc2.setSpecialization("Pediatrician / Child Specialist");
        doc2.setQualification("MBBS, DCH, MD (Pediatrics)");
        doc2.setRoomNumber("Room 202");
        doc2.setConsultationFee(new BigDecimal("50.00"));
        doc2.setAvailableDays("Mon, Tue, Wed, Thu, Fri");
        doc2.setAvailableTimeSlot("09:30 AM - 01:30 PM");
        doctorRepository.save(doc2);

        User docUser3 = userRepository.save(new User("doc_khan", passwordEncoder.encode("doc123"), "Dr. Rashid Khan", "rkhan@amu.ac.in", "9876543222", Role.DOCTOR));
        Doctor doc3 = new Doctor();
        doc3.setUser(docUser3);
        doc3.setDepartment(depOrtho);
        doc3.setSpecialization("Orthopedic Surgeon");
        doc3.setQualification("MBBS, MS (Orthopedics)");
        doc3.setRoomNumber("Room 112");
        doc3.setConsultationFee(new BigDecimal("60.00"));
        doc3.setAvailableDays("Mon, Wed, Fri");
        doc3.setAvailableTimeSlot("10:00 AM - 02:00 PM");
        doctorRepository.save(doc3);

        // 6. Test Patients (Demonstrating the 3 Affiliation Categories)
        // Patient 1: AMU Student (Active)
        User uStu = userRepository.save(new User("student_altaf", passwordEncoder.encode("pat123"), "Altaf Khan", "altaf.student@amu.ac.in", "9876500001", Role.PATIENT));
        Patient pStu = new Patient();
        pStu.setPatientId("PID-1001");
        pStu.setUser(uStu);
        pStu.setFullName("Altaf Khan");
        pStu.setDateOfBirth(LocalDate.of(2002, 5, 14));
        pStu.setGender("Male");
        pStu.setBloodGroup("B+");
        pStu.setMobile("9876500001");
        pStu.setAadhaarRef("XXXX-XXXX-9012");
        pStu.setAbhaRef("91-2034-8891-22");
        pStu.setAffiliationType(AffiliationType.AMU_STUDENT);
        pStu.setAmuIdCardUrl("/uploads/amu_student_card_altaf.jpg");
        pStu.setAffiliationExpiryDate(LocalDate.now().plusYears(2)); // Active!
        patientRepository.save(pStu);

        // Patient 2: AMU Employee (Active)
        User uEmp = userRepository.save(new User("employee_kamran", passwordEncoder.encode("pat123"), "Syed Kamran Ali", "kamran.emp@amu.ac.in", "9876500002", Role.PATIENT));
        Patient pEmp = new Patient();
        pEmp.setPatientId("PID-1002");
        pEmp.setUser(uEmp);
        pEmp.setFullName("Syed Kamran Ali");
        pEmp.setDateOfBirth(LocalDate.of(1985, 8, 20));
        pEmp.setGender("Male");
        pEmp.setBloodGroup("O+");
        pEmp.setMobile("9876500002");
        pEmp.setAadhaarRef("XXXX-XXXX-4567");
        pEmp.setAbhaRef("91-5541-1029-43");
        pEmp.setAffiliationType(AffiliationType.AMU_EMPLOYEE);
        pEmp.setAmuIdCardUrl("/uploads/amu_employee_card_kamran.jpg");
        pEmp.setAffiliationExpiryDate(LocalDate.now().plusYears(5)); // Active!
        patientRepository.save(pEmp);

        // Patient 3: Normal Citizen
        User uNorm = userRepository.save(new User("citizen_ramesh", passwordEncoder.encode("pat123"), "Ramesh Kumar Sharma", "ramesh.sharma@gmail.com", "9876500003", Role.PATIENT));
        Patient pNorm = new Patient();
        pNorm.setPatientId("PID-1003");
        pNorm.setUser(uNorm);
        pNorm.setFullName("Ramesh Kumar Sharma");
        pNorm.setDateOfBirth(LocalDate.of(1992, 11, 30));
        pNorm.setGender("Male");
        pNorm.setBloodGroup("A+");
        pNorm.setMobile("9876500003");
        pNorm.setAadhaarRef("XXXX-XXXX-1122");
        pNorm.setAbhaRef("91-7789-2231-10");
        pNorm.setAffiliationType(AffiliationType.NORMAL_CITIZEN);
        patientRepository.save(pNorm);

        // Patient 4: Pediatric Child booked under Guardian Altaf Khan (PID-1001)
        Patient pChild = new Patient();
        pChild.setPatientId("PID-1004");
        pChild.setUser(null); // Linked to guardian
        pChild.setFullName("Baby Ayan Khan");
        pChild.setDateOfBirth(LocalDate.now().minusYears(4)); // 4 years old (<= 8)
        pChild.setGender("Male");
        pChild.setBloodGroup("B+");
        pChild.setGuardianPatientId("PID-1001");
        pChild.setGuardianRelation("Father");
        pChild.setAadhaarRef("XXXX-XXXX-3344");
        pChild.setAffiliationType(AffiliationType.NORMAL_CITIZEN);
        patientRepository.save(pChild);

        // 7. Pre-seed Sample Live Queue Tokens for Today
        LocalDate today = LocalDate.now();

        // Appointment 1 for Student Altaf (S-001)
        Appointment apt1 = new Appointment();
        apt1.setAppointmentNumber("APT-DEMO-001");
        apt1.setPatient(pStu);
        apt1.setDoctor(doc1);
        apt1.setDepartment(depMed);
        apt1.setAppointmentDate(today);
        apt1.setTimeSlot("10:00 AM - 10:10 AM");
        apt1.setFeeAmount(new BigDecimal("50.00"));
        apt1.setPaymentState(PaymentState.SUCCESSFUL);
        apt1.setTransactionId("TXN-UPI-9901");
        apt1.setPaymentTimestamp(LocalDateTime.now().minusHours(1));
        apt1.setSlipIssued(true);
        apt1.setVerifiedBy("receptionist");
        apt1.setSlipIssuedAt(LocalDateTime.now().minusMinutes(50));
        appointmentRepository.save(apt1);

        OpdToken tok1 = new OpdToken();
        tok1.setTokenNumber("S-001");
        tok1.setTokenPrefix("S");
        tok1.setTokenSequence(1);
        tok1.setAppointment(apt1);
        tok1.setPatient(pStu);
        tok1.setDoctor(doc1);
        tok1.setDepartment(depMed);
        tok1.setQueueDate(today);
        tok1.setStatus(TokenStatus.WAITING);
        tok1.setPriorityWeight(200);
        tokenRepository.save(tok1);

        // Appointment 2 for Citizen Ramesh (N-001)
        Appointment apt2 = new Appointment();
        apt2.setAppointmentNumber("APT-DEMO-002");
        apt2.setPatient(pNorm);
        apt2.setDoctor(doc1);
        apt2.setDepartment(depMed);
        apt2.setAppointmentDate(today);
        apt2.setTimeSlot("10:10 AM - 10:20 AM");
        apt2.setFeeAmount(new BigDecimal("50.00"));
        apt2.setPaymentState(PaymentState.SUCCESSFUL);
        apt2.setTransactionId("TXN-CARD-8802");
        apt2.setPaymentTimestamp(LocalDateTime.now().minusMinutes(45));
        apt2.setSlipIssued(false);
        appointmentRepository.save(apt2);

        OpdToken tok2 = new OpdToken();
        tok2.setTokenNumber("N-001");
        tok2.setTokenPrefix("N");
        tok2.setTokenSequence(1);
        tok2.setAppointment(apt2);
        tok2.setPatient(pNorm);
        tok2.setDoctor(doc1);
        tok2.setDepartment(depMed);
        tok2.setQueueDate(today);
        tok2.setStatus(TokenStatus.WAITING);
        tok2.setPriorityWeight(100);
        tokenRepository.save(tok2);

        // Appointment 3 for Employee Kamran (E-001)
        Appointment apt3 = new Appointment();
        apt3.setAppointmentNumber("APT-DEMO-003");
        apt3.setPatient(pEmp);
        apt3.setDoctor(doc1);
        apt3.setDepartment(depMed);
        apt3.setAppointmentDate(today);
        apt3.setTimeSlot("10:30 AM - 10:45 AM");
        apt3.setFeeAmount(new BigDecimal("50.00"));
        apt3.setPaymentState(PaymentState.SUCCESSFUL);
        apt3.setTransactionId("TXN-NB-7703");
        apt3.setPaymentTimestamp(LocalDateTime.now().minusMinutes(30));
        appointmentRepository.save(apt3);

        OpdToken tok3 = new OpdToken();
        tok3.setTokenNumber("E-001");
        tok3.setTokenPrefix("E");
        tok3.setTokenSequence(1);
        tok3.setAppointment(apt3);
        tok3.setPatient(pEmp);
        tok3.setDoctor(doc1);
        tok3.setDepartment(depMed);
        tok3.setQueueDate(today);
        tok3.setStatus(TokenStatus.WAITING);
        tok3.setPriorityWeight(300);
        tokenRepository.save(tok3);

        System.out.println("Seed data successfully loaded with 5 roles, departments, doctors, and sample queue!");
    }
}
