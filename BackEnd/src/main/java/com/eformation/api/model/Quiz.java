package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@ToString(exclude = {"domain", "level", "questions"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @OneToOne
    @JoinColumn(name = "domain_id")
    @JsonIgnore
    private Domain domain;

    @ManyToOne
    @JoinColumn(name = "level_id")
    @JsonIgnore
    private Level level;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Quiz quiz)) return false;
        return id != null && id.equals(quiz.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}