package com.amu.opd.service;

import com.amu.opd.entity.*;
import com.amu.opd.repository.DoctorRepository;
import com.amu.opd.repository.OpdTokenRepository;
import com.amu.opd.util.IdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class QueueSchedulerService {

    @Autowired
    private OpdTokenRepository tokenRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientService patientService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Generates a category-prefixed token and adds patient to the live OPD queue.
     * Prefixes: N (Normal Citizen), S (AMU Student), E (AMU Employee).
     */
    @Transactional
    public OpdToken generateTokenForAppointment(Appointment appointment) {
        LocalDate today = appointment.getAppointmentDate();
        Patient patient = appointment.getPatient();

        // Evaluate effective affiliation on the appointment date
        AffiliationType effectiveAffiliation = patientService.getEffectiveAffiliation(patient, today);

        String prefix;
        int priorityWeight;

        if (effectiveAffiliation == AffiliationType.AMU_EMPLOYEE) {
            prefix = "E";
            priorityWeight = 300;
        } else if (effectiveAffiliation == AffiliationType.AMU_STUDENT) {
            prefix = "S";
            priorityWeight = 200;
        } else {
            prefix = "N";
            priorityWeight = 100;
        }

        Integer maxSeq = tokenRepository.findMaxSequenceForDateAndPrefix(today, prefix);
        int nextSeq = (maxSeq == null) ? 1 : maxSeq + 1;
        String tokenStr = IdGenerator.formatTokenNumber(prefix, nextSeq);

        OpdToken token = new OpdToken();
        token.setTokenNumber(tokenStr);
        token.setTokenPrefix(prefix);
        token.setTokenSequence(nextSeq);
        token.setAppointment(appointment);
        token.setPatient(patient);
        token.setDoctor(appointment.getDoctor());
        token.setDepartment(appointment.getDepartment());
        token.setQueueDate(today);
        token.setStatus(TokenStatus.WAITING);
        token.setPriorityWeight(priorityWeight);
        token.setTokenIssuedAt(LocalDateTime.now());

        return tokenRepository.save(token);
    }

    /**
     * Priority Queue Dispatch with Anti-Starvation Fairness Mechanism:
     * - Active AMU students and employees receive preference over normal citizens.
     * - Fairness Mechanism: To prevent normal citizen starvation, after every 2 consecutive
     *   priority tokens served, the scheduler dispatches the next waiting Normal (N) token.
     */
    @Transactional
    public OpdToken callNextPatient(Long doctorId, LocalDate queueDate) {
        // Complete any existing in-consultation token
        Optional<OpdToken> activeOpt = tokenRepository.findByDoctorIdAndQueueDateAndStatus(doctorId, queueDate, TokenStatus.IN_CONSULTATION);
        activeOpt.ifPresent(activeToken -> {
            activeToken.setStatus(TokenStatus.COMPLETED);
            activeToken.setConsultationCompletedAt(LocalDateTime.now());
            tokenRepository.save(activeToken);
        });

        List<OpdToken> waitingList = tokenRepository.findByDoctorIdAndQueueDateOrderByPriorityWeightDescTokenSequenceAsc(doctorId, queueDate);
        List<OpdToken> actuallyWaiting = waitingList.stream()
                .filter(t -> t.getStatus() == TokenStatus.WAITING)
                .toList();

        if (actuallyWaiting.isEmpty()) {
            return null; // No waiting patients
        }

        // Check recent history of completed tokens today for this doctor to evaluate fairness
        List<OpdToken> allTokens = tokenRepository.findByDoctorIdAndQueueDateOrderByPriorityWeightDescTokenSequenceAsc(doctorId, queueDate);
        long consecutivePriorityServed = allTokens.stream()
                .filter(t -> t.getStatus() == TokenStatus.COMPLETED)
                .sorted(Comparator.comparing(OpdToken::getConsultationCompletedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(2)
                .filter(t -> "S".equals(t.getTokenPrefix()) || "E".equals(t.getTokenPrefix()))
                .count();

        OpdToken chosenToken = null;

        // Anti-starvation fairness rule: if 2 priority tokens were just served and an 'N' token is waiting, serve 'N' next
        if (consecutivePriorityServed >= 2) {
            Optional<OpdToken> waitingNormal = actuallyWaiting.stream()
                    .filter(t -> "N".equals(t.getTokenPrefix()))
                    .findFirst();
            if (waitingNormal.isPresent()) {
                chosenToken = waitingNormal.get();
            }
        }

        if (chosenToken == null) {
            // Default priority queue order (Highest weight first, then earliest sequence)
            chosenToken = actuallyWaiting.get(0);
        }

        chosenToken.setStatus(TokenStatus.IN_CONSULTATION);
        chosenToken.setConsultationStartedAt(LocalDateTime.now());
        OpdToken saved = tokenRepository.save(chosenToken);

        if (saved.getPatient().getUser() != null) {
            notificationService.sendNotification(
                    saved.getPatient().getUser(),
                    "Now Serving: Your Token Called!",
                    "Token " + saved.getTokenNumber() + " is now being served by Dr. " + saved.getDoctor().getUser().getFullName() + " in Room " + saved.getDoctor().getRoomNumber() + ".",
                    "QUEUE"
            );
        }

        return saved;
    }

    public List<OpdToken> getDoctorLiveQueue(Long doctorId, LocalDate queueDate) {
        return tokenRepository.findByDoctorIdAndQueueDateOrderByPriorityWeightDescTokenSequenceAsc(doctorId, queueDate);
    }

    public List<OpdToken> getDepartmentLiveQueue(Long departmentId, LocalDate queueDate) {
        return tokenRepository.findByDepartmentIdAndQueueDate(departmentId, queueDate);
    }

    public List<Map<String, Object>> getPublicLobbyDisplay(LocalDate queueDate) {
        List<Doctor> doctors = doctorRepository.findAllByActiveTrue();
        List<Map<String, Object>> display = new ArrayList<>();

        for (Doctor d : doctors) {
            Optional<OpdToken> nowServingOpt = tokenRepository.findByDoctorIdAndQueueDateAndStatus(d.getId(), queueDate, TokenStatus.IN_CONSULTATION);
            List<OpdToken> waitingList = tokenRepository.findByDoctorIdAndQueueDateOrderByPriorityWeightDescTokenSequenceAsc(d.getId(), queueDate)
                    .stream().filter(t -> t.getStatus() == TokenStatus.WAITING).toList();

            Map<String, Object> roomData = new HashMap<>();
            roomData.put("roomNumber", d.getRoomNumber());
            roomData.put("doctorName", d.getUser().getFullName());
            roomData.put("departmentName", d.getDepartment().getName());
            roomData.put("nowServing", nowServingOpt.map(OpdToken::getTokenNumber).orElse("Available"));
            roomData.put("waitingCount", waitingList.size());
            roomData.put("nextTokens", waitingList.stream().limit(3).map(OpdToken::getTokenNumber).toList());

            display.add(roomData);
        }

        return display;
    }
}
