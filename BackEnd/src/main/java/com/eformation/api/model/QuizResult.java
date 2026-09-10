package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_results")
@Getter
@Setter
@ToString(exclude = {"user", "quiz"})  // ← Éviter les boucles
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // ← Éviter la sérialisation infinie
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore  // ← Éviter la sérialisation infinie
    private Quiz quiz;

    private int score;
    private boolean isPassed;
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        this.completedAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof QuizResult that)) return false;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}