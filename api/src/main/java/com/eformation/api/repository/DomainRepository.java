package com.eformation.api.repository;

import com.eformation.api.model.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DomainRepository extends JpaRepository<Domain, Long> {
    List<Domain> findByLevelId(Long levelId);
}
