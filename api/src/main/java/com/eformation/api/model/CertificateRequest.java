package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificate_requests")
@Getter
@Setter
@ToString(exclude = {"user", "level"})  // ← Éviter les boucles
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)  // ← LAZY au lieu de EAGER (meilleure performance)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // ← Éviter la sérialisation infinie
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)  // ← LAZY au lieu de EAGER
    @JoinColumn(name = "level_id", nullable = false)
    @JsonIgnore  // ← Éviter la sérialisation infinie
    private Level level;

    @Column(nullable = false)
    private String learnerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CertificateStatus status = CertificateStatus.PENDING;

    private String certificateId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime approvedAt;

    @PrePersist
    protected void onCreate() {
        this.requestedAt = LocalDateTime.now();
        this.certificateId = "EFM-" + java.time.Year.now().getValue()
                + "-" + String.format("%04d", (long)(Math.random() * 9999));
    }

    public enum CertificateStatus {
        PENDING, APPROVED, REJECTED
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CertificateRequest that)) return false;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}