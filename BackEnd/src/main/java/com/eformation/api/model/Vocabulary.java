package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vocabulary")
@Getter
@Setter
@ToString(exclude = "phrase")  // ← Important : éviter la boucle
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String frenchWord;

    @Column(nullable = false)
    private String arabicMeaning;

    @ManyToOne
    @JoinColumn(name = "phrase_id", nullable = false)
    @JsonIgnore
    private Phrase phrase;

    // Éviter la récursion infinie
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Vocabulary that)) return false;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}