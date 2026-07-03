package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "levels")
@Getter
@Setter
@ToString(exclude = "domains")  // Évite la boucle dans toString()
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String color;

    @Column(nullable = false)
    private int orderIndex;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Domain> domains = new HashSet<>();

    // Évite la récursion infinie
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Level level)) return false;
        return id != null && id.equals(level.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}