package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "phrases", indexes = {
    @Index(name = "idx_phrases_domain_id", columnList = "domain_id")
})
@Data
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
    private List<Vocabulary> vocabularyList;
}
