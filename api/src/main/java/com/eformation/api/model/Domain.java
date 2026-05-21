package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "domains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g., Home, School, Hospital...

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "level_id", nullable = false)
    @JsonIgnore
    private Level level;

    @OneToMany(mappedBy = "domain", cascade = CascadeType.ALL)
    private List<Phrase> phrases;
}
