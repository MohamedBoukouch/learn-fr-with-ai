package com.eformation.api.repository;

import com.eformation.api.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    Optional<Quiz> findByDomainId(Long domainId);
    List<Quiz> findByLevelId(Long levelId);
    @Query("SELECT DISTINCT q FROM Quiz q " +
       "LEFT JOIN FETCH q.questions " +
       "WHERE q.id = :quizId")
    Optional<Quiz> findByIdWithQuestions(@Param("quizId") Long quizId);

    @Query("SELECT DISTINCT q FROM Quiz q " +
       "LEFT JOIN FETCH q.questions " +
       "WHERE q.domain.id = :domainId")
    Optional<Quiz> findByDomainIdWithQuestions(@Param("domainId") Long domainId);

}