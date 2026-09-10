package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "domains", indexes = {
    @Index(name = "idx_domains_level_id", columnList = "level_id")
})
@Getter
@Setter
@ToString(exclude = {"level", "phrases"})  // Évite les boucles
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String imageUrl;

    @Column(nullable = true)
    private String topicType;

    @Column(nullable = true)
    private String icon;

    @ManyToOne
    @JoinColumn(name = "level_id", nullable = false)
    @JsonIgnore
    private Level level;

    @OneToMany(mappedBy = "domain", cascade = CascadeType.ALL)
    @JsonIgnore
    private Set<Phrase> phrases = new HashSet<>();

    // Évite la récursion infinie
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Domain domain)) return false;
        return id != null && id.equals(domain.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}