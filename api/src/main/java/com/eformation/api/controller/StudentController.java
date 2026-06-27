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
                .filter(r -> r.getQuiz() != null && r.getQuiz().getDomain() != null)
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
            if (last.getQuiz() != null) {
                if (last.getQuiz().getDomain() != null) {
                    lastActivity.put("domainName", last.getQuiz().getDomain().getName());
                } else {
                    lastActivity.put("domainName", "Quiz: " + last.getQuiz().getTitle());
                }
                lastActivity.put("date", last.getCompletedAt());
            }
        }

        // Calculate Level Progress optimized using bulk queries
        List<Object[]> totalPhrasesRaw = phraseRepository.countPhrasesGroupByDomainId();
        Map<Long, Long> totalPhrasesByDomain = new HashMap<>();
        for (Object[] row : totalPhrasesRaw) {
            totalPhrasesByDomain.put((Long) row[0], (Long) row[1]);
        }

        List<Object[]> completedPhrasesRaw = phraseProgressRepository.countCompletedPhrasesGroupByDomainId(user.getId());
        Map<Long, Long> completedPhrasesByDomain = new HashMap<>();
        for (Object[] row : completedPhrasesRaw) {
            completedPhrasesByDomain.put((Long) row[0], (Long) row[1]);
        }

        List<com.eformation.api.model.Level> levels = levelRepository.findAll();
        List<com.eformation.api.model.Domain> allDomains = domainRepository.findAll();
        Map<Long, List<com.eformation.api.model.Domain>> domainsByLevel = allDomains.stream()
                .collect(Collectors.groupingBy(d -> d.getLevel().getId()));

        Map<Long, Double> levelProgressMap = new HashMap<>();
        levels.forEach(level -> {
            List<com.eformation.api.model.Domain> domains = domainsByLevel.getOrDefault(level.getId(), java.util.Collections.emptyList());
            double levelProgress = domains.stream().mapToDouble(d -> {
                long total = totalPhrasesByDomain.getOrDefault(d.getId(), 0L);
                long completed = completedPhrasesByDomain.getOrDefault(d.getId(), 0L);
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

            // Fetch counts in bulk for this specific level to avoid N+1 queries
            List<Object[]> totalPhrasesRaw = phraseRepository.countPhrasesGroupByDomainIdForLevel(levelId);
            Map<Long, Long> totalPhrasesByDomain = new HashMap<>();
            for (Object[] row : totalPhrasesRaw) {
                totalPhrasesByDomain.put((Long) row[0], (Long) row[1]);
            }

            List<Object[]> completedPhrasesRaw = phraseProgressRepository.countCompletedPhrasesGroupByDomainIdForLevel(levelId, user.getId());
            Map<Long, Long> completedPhrasesByDomain = new HashMap<>();
            for (Object[] row : completedPhrasesRaw) {
                completedPhrasesByDomain.put((Long) row[0], (Long) row[1]);
            }

            List<com.eformation.api.dto.LevelDetailsResponse.DomainProgressDTO> domainDTOs = domains.stream().map(d -> {
                long totalPhrases = totalPhrasesByDomain.getOrDefault(d.getId(), 0L);
                long completedPhrases = completedPhrasesByDomain.getOrDefault(d.getId(), 0L);
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
            
            // Find the index of the last completed phrase, fetching progress ONLY for this domain
            int lastIndex = 0;
            List<com.eformation.api.model.PhraseProgress> progressList = phraseProgressRepository.findByUserIdAndPhraseDomainId(user.getId(), domainId);
            
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
            response.put("levelId", domain.getLevel().getId());
            response.put("lastIndex", lastIndex);
            
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}
