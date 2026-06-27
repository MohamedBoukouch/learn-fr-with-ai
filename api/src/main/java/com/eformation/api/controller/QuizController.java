package com.eformation.api.controller;

import com.eformation.api.model.*;
import com.eformation.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<Quiz> getQuizByDomain(@PathVariable Long domainId) {
        return quizRepository.findByDomainId(domainId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long quizId) {
        return quizRepository.findById(quizId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<?> submitQuiz(@PathVariable Long quizId, @RequestBody Map<Long, String> answers) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        int correctCount = 0;
        for (Question question : quiz.getQuestions()) {
            String userAnswer = answers.get(question.getId());
            if (userAnswer != null && userAnswer.equalsIgnoreCase(question.getCorrectAnswer())) {
                correctCount++;
            }
        }

        int score = (int) (((double) correctCount / quiz.getQuestions().size()) * 100);
        boolean isPassed = score >= 80; // 80% passing grade

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
