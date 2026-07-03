package com.eformation.api.repository;

import com.eformation.api.model.Phrase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PhraseRepository extends JpaRepository<Phrase, Long> {
    List<Phrase> findByDomainIdOrderByOrderIndexAsc(Long domainId);
    long countByDomainId(Long domainId);
    List<Phrase> findByDomainLevelId(Long levelId);

    @Query("SELECT p.domain.id, COUNT(p) FROM Phrase p GROUP BY p.domain.id")
    List<Object[]> countPhrasesGroupByDomainId();

    @Query("SELECT p.domain.id, COUNT(p) FROM Phrase p WHERE p.domain.level.id = :levelId GROUP BY p.domain.id")
    List<Object[]> countPhrasesGroupByDomainIdForLevel(@Param("levelId") Long levelId);

    @Query("SELECT COUNT(p) FROM Phrase p JOIN p.domain d JOIN d.level l WHERE l.name = :levelName")
    Long countByLevelName(@Param("levelName") String levelName);

    // ✅ NOUVELLE MÉTHODE À AJOUTER
    @Query("SELECT DISTINCT p FROM Phrase p " +
           "LEFT JOIN FETCH p.vocabularyList " +
           "WHERE p.domain.id = :domainId " +
           "ORDER BY p.orderIndex ASC")
    List<Phrase> findByDomainIdWithVocabulary(@Param("domainId") Long domainId);
}