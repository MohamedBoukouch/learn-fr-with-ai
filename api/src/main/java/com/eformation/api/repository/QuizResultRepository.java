package com.eformation.api.repository;

import com.eformation.api.model.QuizResult;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByUserId(Long userId);
    void deleteByQuizId(Long quizId);

    @Query("SELECT AVG(qr.score) FROM QuizResult qr")
    Double findAverageScore();

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.isPassed = true")
    Long countPassed();

    // ⚠️ Problème : JOIN FETCH sur deux relations ManyToOne peut causer MultipleBagFetchException
    // Solution 1 : Charger séparément
    @Query("SELECT DISTINCT qr FROM QuizResult qr " +
           "JOIN FETCH qr.user " +
           "ORDER BY qr.completedAt DESC")
    List<QuizResult> findRecentResults(Pageable pageable);

    // Solution 2 alternative : Utiliser @EntityGraph (plus propre)
    // @EntityGraph(attributePaths = {"user", "quiz"})
    // List<QuizResult> findTop10ByOrderByCompletedAtDesc();

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.completedAt >= :since")
    Long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(qr.score) FROM QuizResult qr WHERE qr.user.id = :userId")
    Double findAverageScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(qr.score) FROM QuizResult qr WHERE qr.user.id = :userId AND qr.completedAt < :before")
    Double findAverageScoreBefore(@Param("userId") Long userId, @Param("before") LocalDateTime before);

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.user.id = :userId AND qr.isPassed = true")
    Long countPassedByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(qr.score) FROM QuizResult qr WHERE qr.user.id = :userId")
    Double findMaxScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.user.id = :userId AND qr.completedAt >= :since")
    Long countSinceByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(qr) FROM QuizResult qr WHERE qr.user.id = :userId AND qr.isPassed = true AND " +
           "((qr.quiz.level IS NOT NULL AND qr.quiz.level.name = :levelName) OR " +
           "(qr.quiz.domain IS NOT NULL AND qr.quiz.domain.level.name = :levelName))")
    Long countPassedByUserAndLevel(@Param("userId") Long userId, @Param("levelName") String levelName);
}