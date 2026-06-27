package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "domains", indexes = {
    @Index(name = "idx_domains_level_id", columnList = "level_id")
})
@Data
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
    private List<Phrase> phrases;
}
