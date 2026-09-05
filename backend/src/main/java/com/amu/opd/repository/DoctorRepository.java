package com.amu.opd.repository;

import com.amu.opd.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findAllByActiveTrue();
    List<Doctor> findByDepartmentIdAndActiveTrue(Long departmentId);
    Optional<Doctor> findByUserId(Long userId);
}
