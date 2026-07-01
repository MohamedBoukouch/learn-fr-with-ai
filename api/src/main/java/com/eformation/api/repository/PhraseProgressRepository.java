package com.eformation.api.repository;

import com.eformation.api.model.PhraseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query("SELECT ph.domain.id, COUNT(p) FROM PhraseProgress p JOIN p.phrase ph WHERE p.user.id = :userId GROUP BY ph.domain.id")
    List<Object[]> countCompletedPhrasesGroupByDomainId(@Param("userId") Long userId);

    @Query("SELECT ph.domain.id, COUNT(p) FROM PhraseProgress p JOIN p.phrase ph WHERE ph.domain.level.id = :levelId AND p.user.id = :userId GROUP BY ph.domain.id")
    List<Object[]> countCompletedPhrasesGroupByDomainIdForLevel(@Param("levelId") Long levelId, @Param("userId") Long userId);

    @Query("SELECT p FROM PhraseProgress p JOIN p.phrase ph WHERE p.user.id = :userId AND ph.domain.id = :domainId")
    List<PhraseProgress> findByUserIdAndPhraseDomainId(@Param("userId") Long userId, @Param("domainId") Long domainId);

    @Query("SELECT l.name, COUNT(p), COUNT(DISTINCT p.user) FROM PhraseProgress p JOIN p.phrase ph JOIN ph.domain d JOIN d.level l GROUP BY l.name")
    List<Object[]> getCompletionStatsByLevel();

    @Query("SELECT COUNT(p) FROM PhraseProgress p WHERE p.completedAt >= :since")
    long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT p.user) FROM PhraseProgress p WHERE p.completedAt >= :since")
    long countActiveUsersSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(p) FROM PhraseProgress p WHERE p.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM PhraseProgress p WHERE p.user.id = :userId AND p.completedAt >= :since")
    Long countSinceByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT CAST(p.completedAt AS LocalDate)) FROM PhraseProgress p WHERE p.user.id = :userId AND p.completedAt >= :since")
    Long countDistinctDaysByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT l.name, COUNT(p) FROM PhraseProgress p JOIN p.phrase ph JOIN ph.domain d JOIN d.level l WHERE p.user.id = :userId GROUP BY l.name")
    List<Object[]> getCompletionStatsByLevelForUser(@Param("userId") Long userId);

    @Query("SELECT d.name, COUNT(p) FROM PhraseProgress p JOIN p.phrase ph JOIN ph.domain d WHERE p.user.id = :userId GROUP BY d.name")
    List<Object[]> getCompletionStatsByDomainForUser(@Param("userId") Long userId);

    @Query(value = """
            SELECT COALESCE(MAX(streak_length), 0) FROM (
                SELECT COUNT(*) AS streak_length
                FROM (
                    SELECT activity_day,
                           activity_day - ROW_NUMBER() OVER (ORDER BY activity_day)::integer AS streak_group
                    FROM (
                        SELECT DISTINCT CAST(completed_at AS DATE) AS activity_day
                        FROM phrase_progress
                        WHERE user_id = :userId
                    ) AS days
                ) AS grouped
                GROUP BY streak_group
            ) AS streaks
            """, nativeQuery = true)
    Long findLongestStreakByUserId(@Param("userId") Long userId);

    @Query(value = """
            SELECT CASE
                WHEN COUNT(DISTINCT CAST(completed_at AS DATE)) = 0 THEN 0.0
                ELSE CAST(COUNT(*) AS DOUBLE PRECISION) / COUNT(DISTINCT CAST(completed_at AS DATE))
            END
            FROM phrase_progress
            WHERE user_id = :userId
            """, nativeQuery = true)
    Double findAveragePhrasesPerDay(@Param("userId") Long userId);
}
