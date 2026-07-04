package com.eformation.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "visits", indexes = {
    @Index(name = "idx_visits_date", columnList = "visitDate"),
    @Index(name = "idx_visits_session", columnList = "sessionId"),
    @Index(name = "idx_visits_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // NULL pour les visiteurs anonymes
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // Identifiant unique de session (pour tous : anonymes ET connectés)
    @Column(nullable = false)
    private String sessionId;

    // IP ou fingerprint simple pour identifier les visiteurs uniques anonymes
    @Column(nullable = true)
    private String visitorFingerprint;

    @Column(nullable = false)
    private String page;

    @Column(nullable = false)
    private LocalDateTime visitDate;

    @Column(nullable = false)
    @Builder.Default
    private Integer durationSeconds = 0;

    // Type de visiteur
    @Column(nullable = false)
    @Builder.Default
    private Boolean isAuthenticated = false;

    // Page d'origine (referrer)
    @Column(nullable = true)
    private String referrer;

    // Device info
    @Column(nullable = true)
    private String deviceType;  // mobile, tablet, desktop

    @Column(nullable = true)
    private String browser;

    @PrePersist
    protected void onCreate() {
        this.visitDate = LocalDateTime.now();
    }
}