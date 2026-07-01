package com.eformation.api.repository;

import com.eformation.api.model.CertificateRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRequestRepository extends JpaRepository<CertificateRequest, Long> {

    List<CertificateRequest> findByUserId(Long userId);

    List<CertificateRequest> findByUserIdAndLevelId(Long userId, Long levelId);

    Optional<CertificateRequest> findTopByUserIdAndLevelIdOrderByRequestedAtDesc(Long userId, Long levelId);

    List<CertificateRequest> findAllByOrderByRequestedAtDesc();

    List<CertificateRequest> findByStatus(CertificateRequest.CertificateStatus status);
}
