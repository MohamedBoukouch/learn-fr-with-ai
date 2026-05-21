package com.eformation.api.repository;

import com.eformation.api.model.Phrase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PhraseRepository extends JpaRepository<Phrase, Long> {
    List<Phrase> findByDomainIdOrderByOrderIndexAsc(Long domainId);
    long countByDomainId(Long domainId);
    List<Phrase> findByDomainLevelId(Long levelId);
}
