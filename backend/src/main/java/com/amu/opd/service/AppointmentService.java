package com.amu.opd.service;

import com.amu.opd.dto.AppointmentRequest;
import com.amu.opd.dto.PaymentProcessRequest;
import com.amu.opd.entity.*;
import com.amu.opd.repository.*;
import com.amu.opd.util.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private QueueSchedulerService queueSchedulerService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Appointment bookAppointment(AppointmentRequest request) {
        Patient patient = patientRepository.findByPatientId(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found: " + request.getPatientId()));

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Appointment appointment = new Appointment();
        appointment.setAppointmentNumber(IdGenerator.generateAppointmentNumber());
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDepartment(department);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setTimeSlot(request.getTimeSlot());

        // Fee calculation: e.g. Base consultation fee
        BigDecimal fee = doctor.getConsultationFee() != null ? doctor.getConsultationFee() : new BigDecimal("50.00");
        appointment.setFeeAmount(fee);
        appointment.setPaymentState(PaymentState.PENDING);

        Appointment saved = appointmentRepository.save(appointment);

        if (patient.getUser() != null) {
            notificationService.sendNotification(
                    patient.getUser(),
                    "Appointment Pending Payment",
                    "Appointment " + saved.getAppointmentNumber() + " booked for " + saved.getAppointmentDate() + ". Complete payment to confirm and receive your OPD token.",
                    "APPOINTMENT"
            );
        }

        return saved;
    }

    @Transactional
    public Appointment processPayment(PaymentProcessRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appointment.getPaymentState() == PaymentState.SUCCESSFUL) {
            return appointment; // Already settled
        }

        if (request.isSimulateSuccess()) {
            appointment.setPaymentState(PaymentState.SUCCESSFUL);
            appointment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            appointment.setPaymentTimestamp(LocalDateTime.now());
            appointmentRepository.save(appointment);

            // Generate Token & Queue Entry immediately upon verified payment
            OpdToken token = queueSchedulerService.generateTokenForAppointment(appointment);

            if (appointment.getPatient().getUser() != null) {
                notificationService.sendNotification(
                        appointment.getPatient().getUser(),
                        "Payment Successful & Token Issued",
                        "Payment verified! Your OPD Token is: " + token.getTokenNumber() + " with Dr. " + appointment.getDoctor().getUser().getFullName() + " in Room " + appointment.getDoctor().getRoomNumber() + ".",
                        "PAYMENT"
                );
            }
        } else {
            appointment.setPaymentState(PaymentState.FAILED);
            appointmentRepository.save(appointment);

            if (appointment.getPatient().getUser() != null) {
                notificationService.sendNotification(
                        appointment.getPatient().getUser(),
                        "Payment Failed",
                        "Payment for appointment " + appointment.getAppointmentNumber() + " failed. Please retry payment to confirm your booking.",
                        "PAYMENT"
                );
            }
        }

        return appointment;
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
    }

    public List<Appointment> getDoctorAppointmentsForDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }

    public List<Appointment> getAllDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId);
    }
}
