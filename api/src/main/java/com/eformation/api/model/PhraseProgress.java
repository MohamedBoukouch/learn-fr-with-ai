package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phrase_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "phrase_id"})
})
@Getter
@Setter
@ToString(exclude = {"user", "phrase"})  // ← Éviter les boucles
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhraseProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // ← Éviter la sérialisation infinie
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phrase_id", nullable = false)
    @JsonIgnore  // ← Éviter la sérialisation infinie
    private Phrase phrase;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        this.completedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PhraseProgress that)) return false;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}