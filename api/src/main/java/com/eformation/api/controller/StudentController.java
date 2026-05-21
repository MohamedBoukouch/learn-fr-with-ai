package com.eformation.api.controller;

import com.eformation.api.dto.StudentStatsResponse;
import com.eformation.api.model.QuizResult;
import com.eformation.api.model.User;
import com.eformation.api.repository.DomainRepository;
import com.eformation.api.repository.QuizResultRepository;
import com.eformation.api.repository.PhraseProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private PhraseProgressRepository phraseProgressRepository;

    @Autowired
    private com.eformation.api.repository.PhraseRepository phraseRepository;

    @Autowired
    private com.eformation.api.repository.LevelRepository levelRepository;

    @Autowired
    private com.eformation.api.repository.QuizRepository quizRepository;

    @GetMapping("/stats")
    public ResponseEntity<StudentStatsResponse> getStudentStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        List<QuizResult> results = quizResultRepository.findByUserId(user.getId());
        
        long totalDomains = domainRepository.count();
        long completedDomains = results.stream()
                .filter(QuizResult::isPassed)
                .map(r -> r.getQuiz().getDomain().getId())
                .distinct()
                .count();

        int totalPoints = results.stream()
                .filter(QuizResult::isPassed)
                .mapToInt(QuizResult::getScore)
                .sum();

        int currentStreak = 1;

        Map<String, Object> lastActivity = new HashMap<>();
        if (!results.isEmpty()) {
            QuizResult last = results.get(results.size() - 1);
            lastActivity.put("domainName", last.getQuiz().getDomain().getName());
            lastActivity.put("date", last.getCompletedAt());
        }

        // Calculate Level Progress
        Map<Long, Double> levelProgressMap = new HashMap<>();
        levelRepository.findAll().forEach(level -> {
            List<com.eformation.api.model.Domain> domains = domainRepository.findByLevelId(level.getId());
            double levelProgress = domains.stream().mapToDouble(d -> {
                long total = phraseRepository.countByDomainId(d.getId());
                long completed = phraseProgressRepository.countCompletedPhrasesByDomain(user.getId(), d.getId());
                return total > 0 ? (double) completed / total * 100 : 0;
            }).average().orElse(0);
            levelProgressMap.put(level.getId(), levelProgress);
        });

        StudentStatsResponse response = StudentStatsResponse.builder()
                .totalDomains(totalDomains)
                .completedDomains(completedDomains)
                .totalPoints(totalPoints)
                .currentStreak(currentStreak)
                .lastActivity(lastActivity)
                .levelProgress(levelProgressMap)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/phrases/{phraseId}/complete")
    public ResponseEntity<?> completePhrase(@PathVariable Long phraseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return phraseRepository.findById(phraseId).map(phrase -> {
            if (phraseProgressRepository.findByUserIdAndPhraseId(user.getId(), phraseId).isEmpty()) {
                com.eformation.api.model.PhraseProgress progress = com.eformation.api.model.PhraseProgress.builder()
                        .user(user)
                        .phrase(phrase)
                        .build();
                phraseProgressRepository.save(progress);
            }
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/levels/{levelId}/details")
    public ResponseEntity<com.eformation.api.dto.LevelDetailsResponse> getLevelDetails(@PathVariable Long levelId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return levelRepository.findById(levelId).map(level -> {
            List<com.eformation.api.model.Domain> domains = domainRepository.findByLevelId(levelId);
            List<com.eformation.api.dto.LevelDetailsResponse.DomainProgressDTO> domainDTOs = domains.stream().map(d -> {
                long totalPhrases = phraseRepository.countByDomainId(d.getId());
                long completedPhrases = phraseProgressRepository.countCompletedPhrasesByDomain(user.getId(), d.getId());
                return com.eformation.api.dto.LevelDetailsResponse.DomainProgressDTO.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .imageUrl(d.getImageUrl())
                        .totalPhrases(totalPhrases)
                        .completedPhrases(completedPhrases)
                        .progress(totalPhrases > 0 ? (double) completedPhrases / totalPhrases * 100 : 0)
                        .build();
            }).collect(java.util.stream.Collectors.toList());

            // Handle Quizzes
            List<com.eformation.api.dto.LevelDetailsResponse.QuizProgressDTO> quizDTOs = new java.util.ArrayList<>();
            List<com.eformation.api.model.Quiz> quizzes = quizRepository.findByLevelId(levelId);
            for (com.eformation.api.model.Quiz q : quizzes) {
                Optional<QuizResult> result = quizResultRepository.findByUserId(user.getId()).stream()
                        .filter(r -> r.getQuiz().getId().equals(q.getId()))
                        .findFirst();
                quizDTOs.add(com.eformation.api.dto.LevelDetailsResponse.QuizProgressDTO.builder()
                        .id(q.getId())
                        .title(q.getTitle() != null ? q.getTitle() : "Quiz de Niveau " + level.getName())
                        .completed(result.isPresent())
                        .lastScore(result.map(QuizResult::getScore).orElse(0))
                        .passed(result.map(QuizResult::isPassed).orElse(false))
                        .build());
            }

            double overallProgress = domainDTOs.stream().mapToDouble(d -> d.getProgress()).average().orElse(0);

            return ResponseEntity.ok(com.eformation.api.dto.LevelDetailsResponse.builder()
                    .id(level.getId())
                    .name(level.getName())
                    .color(level.getColor())
                    .overallProgress(overallProgress)
                    .domains(domainDTOs)
                    .quizzes(quizDTOs)
                    .build());
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/domains/{domainId}/details")
    public ResponseEntity<?> getDomainDetails(@PathVariable Long domainId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        return domainRepository.findById(domainId).map(domain -> {
            List<com.eformation.api.model.Phrase> phrases = phraseRepository.findByDomainIdOrderByOrderIndexAsc(domainId);
            
            // Find the index of the last completed phrase
            int lastIndex = 0;
            List<com.eformation.api.model.PhraseProgress> progressList = phraseProgressRepository.findByUserId(user.getId());
            
            for (int i = 0; i < phrases.size(); i++) {
                final Long currentId = phrases.get(i).getId();
                if (progressList.stream().anyMatch(p -> p.getPhrase().getId().equals(currentId))) {
                    lastIndex = i;
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("id", domain.getId());
            response.put("name", domain.getName());
            response.put("levelName", domain.getLevel().getName());
            response.put("levelColor", domain.getLevel().getColor());
            response.put("lastIndex", lastIndex);
            
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}
