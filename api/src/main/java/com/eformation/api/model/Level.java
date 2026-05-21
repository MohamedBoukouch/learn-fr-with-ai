package com.eformation.api.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "levels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Level {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., Pre-A1, A1, B1...

    private String color; // Hex color code

    @Column(nullable = false)
    private int orderIndex;

    @OneToMany(mappedBy = "level", cascade = CascadeType.ALL)
    private List<Domain> domains;
}
