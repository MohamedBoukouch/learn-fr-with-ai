package com.eformation.api.repository;

import com.eformation.api.model.PhraseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhraseProgressRepository extends JpaRepository<PhraseProgress, Long> {
    Optional<PhraseProgress> findByUserIdAndPhraseId(Long userId, Long phraseId);
    
    List<PhraseProgress> findByUserId(Long userId);

    @Query("SELECT COUNT(p) FROM PhraseProgress p JOIN p.phrase ph WHERE p.user.id = :userId AND ph.domain.id = :domainId")
    long countCompletedPhrasesByDomain(@Param("userId") Long userId, @Param("domainId") Long domainId);

    @Query("SELECT COUNT(p) FROM PhraseProgress p JOIN p.phrase ph JOIN ph.domain d WHERE p.user.id = :userId AND d.level.id = :levelId")
    long countCompletedPhrasesByLevel(@Param("userId") Long userId, @Param("levelId") Long levelId);
}
