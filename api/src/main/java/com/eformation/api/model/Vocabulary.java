package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vocabulary")
@Data
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
}
