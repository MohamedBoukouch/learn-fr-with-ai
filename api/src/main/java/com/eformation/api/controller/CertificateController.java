package com.eformation.api.controller;

import com.eformation.api.model.CertificateRequest;
import com.eformation.api.model.CertificateRequest.CertificateStatus;
import com.eformation.api.model.User;
import com.eformation.api.repository.CertificateRequestRepository;
import com.eformation.api.repository.LevelRepository;
import com.eformation.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
public class CertificateController {

    @Autowired
    private CertificateRequestRepository certificateRequestRepository;

    @Autowired
    private LevelRepository levelRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── Student endpoints ───────────────────────────────────────────────────

    /**
     * POST /api/student/certificates
     * Submit a certificate request for the authenticated learner.
     */
    @PostMapping("/api/student/certificates")
    public ResponseEntity<?> submitCertificateRequest(@RequestBody Map<String, Object> body) {
        if (body.get("levelId") == null || body.get("learnerName") == null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "levelId and learnerName are required");
            return ResponseEntity.badRequest().body(error);
        }

        String learnerName = body.get("learnerName").toString().trim();
        if (learnerName.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "learnerName must not be blank");
            return ResponseEntity.badRequest().body(error);
        }

        Long levelId;
        try {
            levelId = Long.parseLong(body.get("levelId").toString());
        } catch (NumberFormatException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "levelId must be a valid number");
            return ResponseEntity.badRequest().body(error);
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return levelRepository.findById(levelId).map(level -> {
            CertificateRequest request = CertificateRequest.builder()
                    .user(user)
                    .level(level)
                    .learnerName(learnerName)
                    .build();

            CertificateRequest saved = certificateRequestRepository.save(request);

            Map<String, Object> response = buildStudentResponse(saved);
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/student/certificates
     * Return all certificate requests for the current user.
     */
    @GetMapping("/api/student/certificates")
    public ResponseEntity<?> getMyCertificates() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        List<CertificateRequest> requests = certificateRequestRepository.findByUserId(user.getId());
        List<Map<String, Object>> response = requests.stream()
                .map(this::buildStudentResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/student/certificates/level/{levelId}
     * Return the latest certificate request for the current user for a specific level.
     */
    @GetMapping("/api/student/certificates/level/{levelId}")
    public ResponseEntity<?> getLatestCertificateForLevel(@PathVariable Long levelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return certificateRequestRepository
                .findTopByUserIdAndLevelIdOrderByRequestedAtDesc(user.getId(), levelId)
                .map(req -> ResponseEntity.ok(buildStudentResponse(req)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Admin endpoints ─────────────────────────────────────────────────────

    /**
     * GET /api/admin/certificates
     * Return all certificate requests across all users (ADMIN only).
     */
    @GetMapping("/api/admin/certificates")
    public ResponseEntity<?> getAllCertificates() {
        List<CertificateRequest> requests = certificateRequestRepository.findAllByOrderByRequestedAtDesc();
        List<Map<String, Object>> response = requests.stream()
                .map(this::buildAdminResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/admin/certificates/{id}/approve
     * Approve a certificate request (ADMIN only).
     */
    @PutMapping("/api/admin/certificates/{id}/approve")
    public ResponseEntity<?> approveCertificate(@PathVariable Long id) {
        return certificateRequestRepository.findById(id).map(req -> {
            req.setStatus(CertificateStatus.APPROVED);
            req.setApprovedAt(LocalDateTime.now());
            CertificateRequest saved = certificateRequestRepository.save(req);
            return ResponseEntity.ok(buildAdminResponse(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/admin/certificates/{id}/reject
     * Reject a certificate request (ADMIN only).
     */
    @PutMapping("/api/admin/certificates/{id}/reject")
    public ResponseEntity<?> rejectCertificate(@PathVariable Long id) {
        return certificateRequestRepository.findById(id).map(req -> {
            req.setStatus(CertificateStatus.REJECTED);
            CertificateRequest saved = certificateRequestRepository.save(req);
            return ResponseEntity.ok(buildAdminResponse(saved));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Object> buildStudentResponse(CertificateRequest req) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", req.getId());
        map.put("levelId", req.getLevel().getId());
        map.put("levelName", req.getLevel().getName());
        map.put("levelColor", req.getLevel().getColor());
        map.put("learnerName", req.getLearnerName());
        map.put("status", req.getStatus().name());
        map.put("certificateId", req.getCertificateId());
        map.put("requestedAt", req.getRequestedAt());
        map.put("approvedAt", req.getApprovedAt());
        return map;
    }

    private Map<String, Object> buildAdminResponse(CertificateRequest req) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", req.getId());
        map.put("userId", req.getUser().getId());
        map.put("userName", req.getUser().getName());
        map.put("userEmail", req.getUser().getEmail());
        map.put("levelId", req.getLevel().getId());
        map.put("levelName", req.getLevel().getName());
        map.put("levelColor", req.getLevel().getColor());
        map.put("learnerName", req.getLearnerName());
        map.put("status", req.getStatus().name());
        map.put("certificateId", req.getCertificateId());
        map.put("requestedAt", req.getRequestedAt());
        map.put("approvedAt", req.getApprovedAt());
        return map;
    }
}
