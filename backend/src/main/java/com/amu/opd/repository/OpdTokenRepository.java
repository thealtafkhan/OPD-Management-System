package com.amu.opd.repository;

import com.amu.opd.entity.OpdToken;
import com.amu.opd.entity.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OpdTokenRepository extends JpaRepository<OpdToken, Long> {
    Optional<OpdToken> findByAppointmentId(Long appointmentId);
    List<OpdToken> findByPatientIdOrderByQueueDateDesc(Long patientId);
    
    // Find highest token sequence for today and prefix
    @Query("SELECT MAX(t.tokenSequence) FROM OpdToken t WHERE t.queueDate = :queueDate AND t.tokenPrefix = :prefix")
    Integer findMaxSequenceForDateAndPrefix(@Param("queueDate") LocalDate queueDate, @Param("prefix") String prefix);

    // Live Queue for doctor on date
    List<OpdToken> findByDoctorIdAndQueueDateOrderByPriorityWeightDescTokenSequenceAsc(Long doctorId, LocalDate queueDate);
    
    // Live Queue for department
    List<OpdToken> findByDepartmentIdAndQueueDate(Long departmentId, LocalDate queueDate);

    // Active token in consultation for a doctor
    Optional<OpdToken> findByDoctorIdAndQueueDateAndStatus(Long doctorId, LocalDate queueDate, TokenStatus status);
}
