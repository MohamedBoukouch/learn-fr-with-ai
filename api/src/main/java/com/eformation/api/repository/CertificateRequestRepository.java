package com.eformation.api.repository;

import com.eformation.api.model.CertificateRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {

    List<CertificateRequest> findByUserId(Long userId);

    List<CertificateRequest> findByUserIdAndLevelId(Long userId, Long levelId);

    Optional<CertificateRequest> findTopByUserIdAndLevelIdOrderByRequestedAtDesc(Long userId, Long levelId);

    List<CertificateRequest> findAllByOrderByRequestedAtDesc();

    List<CertificateRequest> findByStatus(CertificateRequest.CertificateStatus status);

    // ✅ Nouvelles méthodes avec JOIN FETCH pour charger les relations
    @Query("SELECT DISTINCT cr FROM CertificateRequest cr " +
           "JOIN FETCH cr.user " +
           "JOIN FETCH cr.level " +
           "ORDER BY cr.requestedAt DESC")
    List<CertificateRequest> findAllWithDetails();

    @Query("SELECT DISTINCT cr FROM CertificateRequest cr " +
           "JOIN FETCH cr.user " +
           "JOIN FETCH cr.level " +
           "WHERE cr.user.id = :userId " +
           "ORDER BY cr.requestedAt DESC")
    List<CertificateRequest> findByUserIdWithDetails(@Param("userId") Long userId);
}