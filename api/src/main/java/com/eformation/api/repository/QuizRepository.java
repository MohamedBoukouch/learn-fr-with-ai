package com.eformation.api.repository;

import com.eformation.api.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByDomainId(Long domainId);
    List<Quiz> findByLevelId(Long levelId);
}
