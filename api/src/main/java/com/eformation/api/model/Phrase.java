package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "phrases", indexes = {
    @Index(name = "idx_phrases_domain_id", columnList = "domain_id")
})
@Getter
@Setter
@ToString(exclude = {"domain", "vocabularyList"})  // Évite les boucles
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phrase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String frenchText;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String arabicTranslation;

    @Column(nullable = false)
    private int orderIndex;

    @ManyToOne
    @JoinColumn(name = "domain_id", nullable = false)
    @JsonIgnore
    private Domain domain;

    @OneToMany(mappedBy = "phrase", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Vocabulary> vocabularyList = new ArrayList<>();

    // Évite la récursion infinie
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Phrase phrase)) return false;
        return id != null && id.equals(phrase.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}