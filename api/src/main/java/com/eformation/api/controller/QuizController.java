package com.eformation.api.controller;

import com.eformation.api.model.*;
import com.eformation.api.repository.*;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/domain/{domainId}")
    @Transactional
    public ResponseEntity<Quiz> getQuizByDomain(@PathVariable Long domainId) {
        Quiz quiz = quizRepository.findByDomainIdWithQuestions(domainId).orElse(null);
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }
        // FORCER l'initialisation
        Hibernate.initialize(quiz.getQuestions());
        quiz.getQuestions().forEach(q -> Hibernate.initialize(q.getOptions()));
        return ResponseEntity.ok(quiz);
    }

    @GetMapping("/{quizId}")
    @Transactional
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long quizId) {
        Quiz quiz = quizRepository.findByIdWithQuestions(quizId).orElse(null);
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }
        // FORCER l'initialisation
        Hibernate.initialize(quiz.getQuestions());
        quiz.getQuestions().forEach(q -> Hibernate.initialize(q.getOptions()));
        return ResponseEntity.ok(quiz);
    }

    @PostMapping("/{quizId}/submit")
    @Transactional
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId, @RequestBody Map<Long, String> answers) {
        Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        
        Hibernate.initialize(quiz.getQuestions());

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        int correctCount = 0;
        for (Question question : quiz.getQuestions()) {
            String userAnswer = answers.get(question.getId());
            if (userAnswer != null && userAnswer.equalsIgnoreCase(question.getCorrectAnswer())) {
                correctCount++;
            }
        }

        int score = (int) (((double) correctCount / quiz.getQuestions().size()) * 100);
        boolean isPassed = score >= 80;

        QuizResult result = QuizResult.builder()
                .user(user)
                .quiz(quiz)
                .score(score)
                .isPassed(isPassed)
                .build();

        quizResultRepository.save(result);

        return ResponseEntity.ok(Map.of(
            "score", score,
            "passed", isPassed,
            "correctCount", correctCount,
            "totalQuestions", quiz.getQuestions().size()
        ));
    }
}