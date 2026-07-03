package com.eformation.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = "passwordHash")  // ← Exclure le mot de passe du toString()
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    @JsonIgnore  // ← NE JAMAIS exposer le hash du mot de passe
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private boolean isApproved;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean emmaAccess = false;

    @Column(nullable = true)
    private LocalDate emmaAccessStartDate;

    @Column(nullable = true)
    private LocalDate emmaAccessEndDate;

    @Column(nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean emmaAccessRevoked = false;

    @Column(nullable = true)
    private String groupName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public String getFirstName() {
        if (name == null) return "";
        String[] parts = name.trim().split("\\s+", 2);
        return parts[0];
    }

    public String getLastName() {
        if (name == null) return "";
        String[] parts = name.trim().split("\\s+", 2);
        return parts.length > 1 ? parts[1] : "";
    }

    @Override
    @JsonIgnore  // ← Ne pas sérialiser les autorités
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    @JsonIgnore  // ← Ne pas exposer le mot de passe
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return role == Role.ADMIN || isApproved;
    }

    // Important : basé sur l'ID uniquement
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User user)) return false;
        return id != null && id.equals(user.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}