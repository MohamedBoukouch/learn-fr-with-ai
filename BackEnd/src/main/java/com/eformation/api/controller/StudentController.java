package com.eformation.api.controller;

import com.eformation.api.dto.*;
import com.eformation.api.model.QuizResult;
import com.eformation.api.model.User;
import com.eformation.api.repository.DomainRepository;
import com.eformation.api.repository.QuizResultRepository;
import com.eformation.api.repository.PhraseProgressRepository;
import com.eformation.api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

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


    @GetMapping("/stats/detailed")
    public ResponseEntity<Map<String, Object>> getDetailedStudentStats() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();

        Map<String, Object> stats = new HashMap<>();

        Long totalPhrasesLearned = phraseProgressRepository.countByUserId(userId);
        Long totalQuizzesCompleted = quizResultRepository.countByUserId(userId);
        stats.put("totalPhrasesLearned", totalPhrasesLearned != null ? totalPhrasesLearned : 0L);
        stats.put("totalQuizzesCompleted", totalQuizzesCompleted != null ? totalQuizzesCompleted : 0L);

        Double avgScore = quizResultRepository.findAverageScoreByUserId(userId);
        stats.put("averageQuizScore", Math.round(avgScore != null ? avgScore : 0));

        Double prevAvgScore = quizResultRepository.findAverageScoreBefore(userId, LocalDateTime.now().minusDays(7));
        stats.put("previousAverageScore", Math.round(prevAvgScore != null ? prevAvgScore : 0));

        Long passedQuizzes = quizResultRepository.countPassedByUserId(userId);
        long totalQuizzes = totalQuizzesCompleted != null ? totalQuizzesCompleted : 0L;
        long passed = passedQuizzes != null ? passedQuizzes : 0L;
        stats.put("quizPassRate", totalQuizzes > 0 ? Math.round((passed * 100.0) / totalQuizzes) : 0L);

        Long activeDays = phraseProgressRepository.countDistinctDaysByUserId(userId, LocalDateTime.now().minusDays(30));
        stats.put("activeDays", activeDays != null ? activeDays : 0L);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        Map<String, Object> last7Days = new HashMap<>();
        last7Days.put("quizzesCompleted", nullSafeLong(quizResultRepository.countSinceByUserId(userId, sevenDaysAgo)));
        last7Days.put("phrasesLearned", nullSafeLong(phraseProgressRepository.countSinceByUserId(userId, sevenDaysAgo)));
        stats.put("last7Days", last7Days);

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Map<String, Object> last30Days = new HashMap<>();
        last30Days.put("quizzesCompleted", nullSafeLong(quizResultRepository.countSinceByUserId(userId, thirtyDaysAgo)));
        last30Days.put("phrasesLearned", nullSafeLong(phraseProgressRepository.countSinceByUserId(userId, thirtyDaysAgo)));
        stats.put("last30Days", last30Days);

        Map<String, Long> phrasesByLevel = new HashMap<>();
        for (Object[] row : phraseProgressRepository.getCompletionStatsByLevelForUser(userId)) {
            phrasesByLevel.put((String) row[0], (Long) row[1]);
        }

        Map<String, Map<String, Object>> levelProgress = new HashMap<>();
        for (String levelName : Arrays.asList("A1", "A2", "B1", "B2", "C1", "C2")) {
            Long phrasesLearned = phrasesByLevel.getOrDefault(levelName, 0L);
            Long quizzesPassed = nullSafeLong(quizResultRepository.countPassedByUserAndLevel(userId, levelName));
            Long totalPhrasesInLevel = phraseRepository.countByLevelName(levelName);
            long totalInLevel = totalPhrasesInLevel != null ? totalPhrasesInLevel : 0L;

            Map<String, Object> levelData = new HashMap<>();
            levelData.put("phrasesLearned", phrasesLearned);
            levelData.put("quizzesPassed", quizzesPassed);
            levelData.put("percentage", totalInLevel > 0 ? Math.round((phrasesLearned * 100.0) / totalInLevel) : 0L);
            levelProgress.put(levelName, levelData);
        }
        stats.put("levelProgress", levelProgress);

        // Calculate domain progress
        Map<String, Long> phrasesByDomain = new HashMap<>();
        for (Object[] row : phraseProgressRepository.getCompletionStatsByDomainForUser(userId)) {
            phrasesByDomain.put((String) row[0], (Long) row[1]);
        }

        Map<String, Long> domainProgress = new HashMap<>();
        List<com.eformation.api.model.Domain> allDomains = domainRepository.findAll();
        for (com.eformation.api.model.Domain domain : allDomains) {
            Long phrasesLearned = phrasesByDomain.getOrDefault(domain.getName(), 0L);
            Long totalPhrasesInDomain = phraseRepository.countByDomainId(domain.getId());
            long totalInDomain = totalPhrasesInDomain != null ? totalPhrasesInDomain : 0L;
            if (totalInDomain > 0) {
                domainProgress.put(domain.getId().toString(), Math.round((phrasesLearned * 100.0) / totalInDomain));
            }
        }
        stats.put("domainProgress", domainProgress);

        Double maxScore = quizResultRepository.findMaxScoreByUserId(userId);
        Long longestStreak = phraseProgressRepository.findLongestStreakByUserId(userId);
        Double phrasesPerDay = phraseProgressRepository.findAveragePhrasesPerDay(userId);

        Map<String, Object> insights = new HashMap<>();
        insights.put("bestQuizScore", Math.round(maxScore != null ? maxScore : 0));
        insights.put("longestStreak", longestStreak != null ? longestStreak : 0L);
        insights.put("phrasesPerDay", phrasesPerDay != null ? Math.round(phrasesPerDay * 10.0) / 10.0 : 0.0);
        stats.put("insights", insights);

        return ResponseEntity.ok(stats);
    }

    private long nullSafeLong(Long value) {
        return value != null ? value : 0L;
    }

    // --- Profile Management ---

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("isApproved", user.isApproved());
        profile.put("createdAt", user.getCreatedAt());
        profile.put("emmaAccess", user.isEmmaAccess());
        profile.put("emmaAccessStartDate", user.getEmmaAccessStartDate());
        profile.put("emmaAccessEndDate", user.getEmmaAccessEndDate());

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        user.setName(request.getName());
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
    }

    @PutMapping("/profile/email")
    @Transactional
    public ResponseEntity<?> changeEmail(@Valid @RequestBody ChangeEmailRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        // Check if new email is already in use
        if (userRepository.findByEmail(request.getNewEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        // Update email and set approval to false
        user.setEmail(request.getNewEmail());
        user.setApproved(false);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Email updated successfully. Your account now requires admin approval."));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        // Verify current password
        if (!encoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Current password is incorrect"));
        }

        // Update password
        user.setPasswordHash(encoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
    }

    @DeleteMapping("/profile")
    @Transactional
    public ResponseEntity<?> deleteAccount(@Valid @RequestBody DeleteAccountRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();

        // Require confirmation
        if (!"DELETE".equals(request.getConfirmation())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Please type 'DELETE' to confirm account deletion"));
        }

        // Delete user and all related data (cascade will handle related entities)
        userRepository.delete(user);

        return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
    }

}
