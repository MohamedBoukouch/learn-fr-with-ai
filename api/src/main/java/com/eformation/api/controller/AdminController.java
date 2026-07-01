package com.eformation.api.controller;

import com.eformation.api.dto.MessageResponse;
import com.eformation.api.model.User;
import com.eformation.api.model.Phrase;
import com.eformation.api.model.Vocabulary;
import com.eformation.api.model.Domain;
import com.eformation.api.model.Level;
import com.eformation.api.repository.UserRepository;
import com.eformation.api.repository.LevelRepository;
import com.eformation.api.repository.DomainRepository;
import com.eformation.api.repository.PhraseRepository;
import com.eformation.api.repository.VocabularyRepository;
import com.eformation.api.repository.SystemSettingRepository;
import com.eformation.api.repository.PhraseProgressRepository;
import com.eformation.api.repository.SettingsRepository;
import com.eformation.api.model.SystemSetting;
import com.eformation.api.model.Settings;
import com.eformation.api.service.AiService;
import com.eformation.api.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import org.springframework.data.domain.PageRequest;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    AiService aiService;

    @Autowired
    LevelRepository levelRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DomainRepository domainRepository;

    @Autowired
    PhraseRepository phraseRepository;

    @Autowired
    VocabularyRepository vocabularyRepository;

    @Autowired
    FileStorageService fileStorageService;

    @Autowired
    com.eformation.api.repository.QuizRepository quizRepository;

    @Autowired
    com.eformation.api.repository.QuizResultRepository quizResultRepository;

    @Autowired
    SystemSettingRepository systemSettingRepository;

    @Autowired
    PhraseProgressRepository phraseProgressRepository;

    @Autowired
    SettingsRepository settingsRepository;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileName = fileStorageService.save(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", "/uploads/" + fileName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/levels/{levelId}/domains")
    public ResponseEntity<?> addDomain(@PathVariable Long levelId, @RequestBody Domain domain) {
        return levelRepository.findById(levelId).map(level -> {
            domain.setLevel(level);
            return ResponseEntity.ok(domainRepository.save(domain));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/domains/{domainId}/phrases")
    @Transactional
    public ResponseEntity<?> addPhrase(@PathVariable Long domainId, @RequestBody Phrase phrase) {
        return domainRepository.findById(domainId).map(domain -> {
            try {
                phrase.setDomain(domain);
                List<Vocabulary> vocabs = phrase.getVocabularyList();
                phrase.setVocabularyList(null); 
                Phrase savedPhrase = phraseRepository.save(phrase);
                if (vocabs != null && !vocabs.isEmpty()) {
                    for (Vocabulary v : vocabs) {
                        v.setPhrase(savedPhrase);
                        vocabularyRepository.save(v);
                    }
                    savedPhrase.setVocabularyList(vocabs);
                }
                return ResponseEntity.ok(savedPhrase);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body(new MessageResponse("Database error: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("pendingUsers", userRepository.countByApproved(false));
        stats.put("approvedUsers", userRepository.countByApproved(true));
        stats.put("totalLevels", levelRepository.count());
        stats.put("totalDomains", domainRepository.count());
        stats.put("totalPhrases", phraseRepository.count());
        stats.put("totalQuizzes", quizRepository.count());
        stats.put("totalQuizResults", quizResultRepository.count());
        stats.put("totalVocabulary", vocabularyRepository.count());
        stats.put("totalPhraseProgress", phraseProgressRepository.count());
        stats.put("emmaAccessUsers", userRepository.countByEmmaAccess(true));
        
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        stats.put("quizResultsLast7Days", quizResultRepository.countSince(sevenDaysAgo));
        stats.put("phrasesLearnedLast7Days", phraseProgressRepository.countSince(sevenDaysAgo));
        stats.put("activeUsersLast7Days", phraseProgressRepository.countActiveUsersSince(sevenDaysAgo));
        
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        stats.put("quizResultsLast30Days", quizResultRepository.countSince(thirtyDaysAgo));
        stats.put("phrasesLearnedLast30Days", phraseProgressRepository.countSince(thirtyDaysAgo));
        stats.put("activeUsersLast30Days", phraseProgressRepository.countActiveUsersSince(thirtyDaysAgo));
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/stats/quiz-averages")
    public ResponseEntity<?> getQuizAverages() {
        Map<String, Object> result = new HashMap<>();
        Double averageScore = quizResultRepository.findAverageScore();
        result.put("averageScore", averageScore != null ? averageScore : 0.0);
        Long passedCount = quizResultRepository.countPassed();
        result.put("passedQuizzes", passedCount != null ? passedCount : 0L);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats/level-distribution")
    public ResponseEntity<?> getLevelDistribution() {
        return ResponseEntity.ok(phraseProgressRepository.getCompletionStatsByLevel());
    }

    @GetMapping("/stats/recent-activity")
    public ResponseEntity<?> getRecentActivity() {
        return ResponseEntity.ok(quizResultRepository.findRecentResults(PageRequest.of(0, 10)));
    }

    @PostMapping("/ai/generate-domains")
    public ResponseEntity<?> generateDomains(@RequestBody Map<String, Object> payload) {
        try {
            String level = (String) payload.get("level");
            int count = (int) payload.getOrDefault("count", 5);
            List<String> existingDomains = (List<String>) payload.getOrDefault("existingDomains", List.of());
            String guide = (String) payload.get("guide");
            String result = aiService.generateContent(aiService.getDomainGenerationPrompt(level, count, existingDomains, guide));
            if (result.startsWith("Error")) {
                return ResponseEntity.internalServerError().body(new MessageResponse(result));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/ai/generate-phrases")
    public ResponseEntity<?> generatePhrases(@RequestBody Map<String, Object> payload) {
        try {
            String domain = (String) payload.get("domain");
            String level = (String) payload.get("level");
            int count = (int) payload.getOrDefault("count", 10);
            List<String> existingPhrases = (List<String>) payload.getOrDefault("existingPhrases", List.of());
            String guide = (String) payload.get("guide");
            String result = aiService.generateContent(aiService.getPhraseGenerationPrompt(domain, level, count, existingPhrases, guide));
            if (result.startsWith("Error")) {
                return ResponseEntity.internalServerError().body(new MessageResponse(result));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/ai/generate-quizzes")
    public ResponseEntity<?> generateLevelQuizzes(@RequestBody Map<String, Object> payload) {
        try {
            Long levelId = Long.valueOf(payload.get("levelId").toString());
            com.eformation.api.model.Level level = levelRepository.findById(levelId)
                    .orElseThrow(() -> new RuntimeException("Level not found"));
            
            int count = 5;
            if (payload.containsKey("count") && payload.get("count") != null) {
                count = Integer.parseInt(payload.get("count").toString());
            }
            String guide = (String) payload.get("guide");

            List<Phrase> phrases = phraseRepository.findByDomainLevelId(levelId);
            List<String> phraseTexts = phrases.stream()
                    .map(Phrase::getFrenchText)
                    .collect(java.util.stream.Collectors.toList());
            
            String result = aiService.generateContent(aiService.getLevelQuizGenerationPrompt(level.getName(), count, phraseTexts, guide));
            if (result.startsWith("Error")) {
                return ResponseEntity.internalServerError().body(new MessageResponse(result));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new MessageResponse(e.getMessage()));
        }
    }

    // --- Levels ---
    @PutMapping("/levels/{id}")
    public ResponseEntity<?> updateLevel(@PathVariable Long id, @RequestBody Level level) {
        return levelRepository.findById(id).map(existingLevel -> {
            existingLevel.setName(level.getName());
            existingLevel.setColor(level.getColor());
            existingLevel.setOrderIndex(level.getOrderIndex());
            return ResponseEntity.ok(levelRepository.save(existingLevel));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/levels/{id}")
    public ResponseEntity<?> deleteLevel(@PathVariable Long id) {
        return levelRepository.findById(id).map(level -> {
            levelRepository.delete(level);
            return ResponseEntity.ok(new MessageResponse("Level deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Quizzes ---
    @GetMapping("/levels/{levelId}/quizzes")
    public ResponseEntity<?> getLevelQuizzes(@PathVariable Long levelId) {
        return ResponseEntity.ok(quizRepository.findByLevelId(levelId));
    }

    @PostMapping("/levels/{levelId}/quizzes")
    @Transactional
    public ResponseEntity<?> createQuiz(@PathVariable Long levelId, @RequestBody com.eformation.api.model.Quiz quiz) {
        try {
            return levelRepository.findById(levelId).map(level -> {
                quiz.setLevel(level);
                if (quiz.getQuestions() != null) {
                    for (com.eformation.api.model.Question q : quiz.getQuestions()) {
                        q.setQuiz(quiz);
                    }
                }
                return ResponseEntity.ok(quizRepository.save(quiz));
            }).orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            String cause = e.getCause() != null ? e.getCause().getMessage() : "";
            if (e.getCause() != null && e.getCause().getCause() != null) {
                cause += " | " + e.getCause().getCause().getMessage();
            }
            return ResponseEntity.internalServerError().body(new com.eformation.api.dto.MessageResponse("Error: " + e.getMessage() + " | " + cause));
        }
    }

    @PutMapping("/quizzes/{quizId}")
    @Transactional
    public ResponseEntity<?> updateQuiz(@PathVariable Long quizId, @RequestBody com.eformation.api.model.Quiz quizDetails) {
        return quizRepository.findById(quizId).map(quiz -> {
            quiz.setTitle(quizDetails.getTitle());
            
            // clear and set questions to ensure orphanRemoval is triggered correctly
            if (quiz.getQuestions() != null) {
                quiz.getQuestions().clear();
                quizRepository.saveAndFlush(quiz);
            } else {
                quiz.setQuestions(new java.util.ArrayList<>());
            }
            
            if (quizDetails.getQuestions() != null) {
                for (com.eformation.api.model.Question q : quizDetails.getQuestions()) {
                    q.setId(null);
                    q.setQuiz(quiz);
                    quiz.getQuestions().add(q);
                }
            }
            return ResponseEntity.ok(quizRepository.save(quiz));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/quizzes/{quizId}")
    @Transactional
    public ResponseEntity<?> deleteQuiz(@PathVariable Long quizId) {
        return quizRepository.findById(quizId).map(quiz -> {
            quizResultRepository.deleteByQuizId(quizId);
            quizRepository.delete(quiz);
            return ResponseEntity.ok(new MessageResponse("Quiz deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Domains ---
    @PutMapping("/domains/{id}")
    public ResponseEntity<?> updateDomain(@PathVariable Long id, @RequestBody Domain domainDetails) {
        return domainRepository.findById(id).map(domain -> {
            domain.setName(domainDetails.getName());
            domain.setImageUrl(domainDetails.getImageUrl());
            return ResponseEntity.ok(domainRepository.save(domain));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/domains/{id}")
    public ResponseEntity<?> deleteDomain(@PathVariable Long id) {
        return domainRepository.findById(id).map(domain -> {
            domainRepository.delete(domain);
            return ResponseEntity.ok(new MessageResponse("Domain deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Phrases ---
    @PutMapping("/phrases/{id}")
    @Transactional
    public ResponseEntity<?> updatePhrase(@PathVariable Long id, @RequestBody Phrase phraseDetails) {
        System.out.println("Updating phrase ID: " + id);
        return phraseRepository.findById(id).map(phrase -> {
            try {
                phrase.setFrenchText(phraseDetails.getFrenchText());
                phrase.setArabicTranslation(phraseDetails.getArabicTranslation());
                if (phrase.getVocabularyList() != null) {
                    phrase.getVocabularyList().clear();
                    phraseRepository.saveAndFlush(phrase);
                }
                Phrase savedPhrase = phraseRepository.save(phrase);
                if (phraseDetails.getVocabularyList() != null) {
                    for (Vocabulary v : phraseDetails.getVocabularyList()) {
                        v.setId(null);
                        v.setPhrase(savedPhrase);
                        vocabularyRepository.save(v);
                    }
                }
                return ResponseEntity.ok(savedPhrase);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body(new MessageResponse("Update failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/phrases/{id}")
    public ResponseEntity<?> deletePhrase(@PathVariable Long id) {
        return phraseRepository.findById(id).map(phrase -> {
            phraseRepository.delete(phrase);
            return ResponseEntity.ok(new MessageResponse("Phrase deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/domains/{domainId}/phrases/bulk")
    @Transactional
    public ResponseEntity<?> saveBulkPhrases(@PathVariable Long domainId, @RequestBody Map<String, List<Phrase>> payload) {
        List<Phrase> phrases = payload.get("phrases");
        if (phrases == null || phrases.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("No phrases provided."));
        }
        return domainRepository.findById(domainId).map(domain -> {
            try {
                for (int i = 0; i < phrases.size(); i++) {
                    Phrase phrase = phrases.get(i);
                    phrase.setDomain(domain);
                    if (phrase.getOrderIndex() == 0) phrase.setOrderIndex(i);
                    phrase.setId(null);
                    List<Vocabulary> vocabs = phrase.getVocabularyList();
                    phrase.setVocabularyList(null);
                    Phrase savedPhrase = phraseRepository.save(phrase);
                    if (vocabs != null) {
                        for (Vocabulary v : vocabs) {
                            v.setId(null);
                            v.setPhrase(savedPhrase);
                            vocabularyRepository.save(v);
                        }
                    }
                }
                return ResponseEntity.ok(new MessageResponse("Saved " + phrases.size() + " phrases successfully!"));
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.internalServerError().body(new MessageResponse("Bulk save failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Users ---
    @GetMapping("/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @PutMapping("/users/{id}/approve")
    public ResponseEntity<?> toggleUserApproval(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setApproved(!user.isApproved());
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User status updated to " + (user.isApproved() ? "Approved" : "Disapproved")));
        }).orElse(ResponseEntity.status(404).body(new MessageResponse("User not found with ID: " + id)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok(new MessageResponse("User deleted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        List<SystemSetting> settings = systemSettingRepository.findAll();
        Map<String, String> settingsMap = new HashMap<>();
        for (SystemSetting s : settings) {
            settingsMap.put(s.getKey(), s.getValue());
        }
        return ResponseEntity.ok(settingsMap);
    }

    @PostMapping("/settings")
    public ResponseEntity<?> saveSetting(@RequestBody Map<String, String> payload) {
        String key = payload.get("key");
        String value = payload.get("value");
        if (key == null || value == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Key and value are required"));
        }
        SystemSetting setting = SystemSetting.builder()
                .key(key)
                .value(value)
                .build();
        systemSettingRepository.save(setting);
        return ResponseEntity.ok(new MessageResponse("Setting saved successfully"));
    }

    @DeleteMapping("/settings/{key}")
    public ResponseEntity<?> deleteSetting(@PathVariable String key) {
        if (systemSettingRepository.existsById(key)) {
            systemSettingRepository.deleteById(key);
            return ResponseEntity.ok(new MessageResponse("Setting deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/users/groups")
    public ResponseEntity<List<String>> listDistinctGroups() {
        return ResponseEntity.ok(userRepository.findDistinctGroupNames());
    }

    @PutMapping("/users/{id}/emma-access")
    public ResponseEntity<?> toggleUserEmmaAccess(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setEmmaAccess(!user.isEmmaAccess());
            user.setEmmaAccessRevoked(false);
            if (!user.isEmmaAccess()) {
                user.setEmmaAccessStartDate(null);
                user.setEmmaAccessEndDate(null);
            }
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User Emma AI access updated to " + (user.isEmmaAccess() ? "Enabled" : "Disabled")));
        }).orElse(ResponseEntity.status(404).body(new MessageResponse("User not found with ID: " + id)));
    }

    @PutMapping("/users/{id}/emma-access/plan")
    public ResponseEntity<?> updateUserEmmaAccessPlan(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return userRepository.findById(id).map(user -> {
            Boolean enabled = (Boolean) payload.get("enabled");
            if (enabled != null) {
                user.setEmmaAccess(enabled);
            }
            if (payload.containsKey("startDate") && payload.get("startDate") != null) {
                user.setEmmaAccessStartDate(LocalDate.parse(payload.get("startDate").toString()));
            }
            if (payload.containsKey("endDate") && payload.get("endDate") != null) {
                user.setEmmaAccessEndDate(LocalDate.parse(payload.get("endDate").toString()));
            }
            if (payload.containsKey("revoked")) {
                user.setEmmaAccessRevoked(Boolean.parseBoolean(payload.get("revoked").toString()));
            }
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Emma access plan updated successfully"));
        }).orElse(ResponseEntity.status(404).body(new MessageResponse("User not found with ID: " + id)));
    }

    @PutMapping("/users/{id}/group")
    public ResponseEntity<?> updateUserGroup(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String groupName = payload.get("groupName");
        return userRepository.findById(id).map(user -> {
            user.setGroupName(groupName);
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User group updated successfully"));
        }).orElse(ResponseEntity.status(404).body(new MessageResponse("User not found with ID: " + id)));
    }

    // --- Default User Approval Status Settings ---

    @GetMapping("/settings/default-user-approval")
    public ResponseEntity<?> getDefaultUserApprovalStatus() {
        String key = "default_user_approval";
        return settingsRepository.findByKey(key)
            .map(setting -> ResponseEntity.ok(Map.of(
                "key", setting.getKey(),
                "value", setting.getValue(),
                "description", setting.getDescription()
            )))
            .orElse(ResponseEntity.ok(Map.of(
                "key", key,
                "value", "pending",
                "description", "Default approval status for new registered users"
            )));
    }

    @PutMapping("/settings/default-user-approval")
    public ResponseEntity<?> updateDefaultUserApprovalStatus(@RequestBody Map<String, String> payload) {
        String value = payload.get("value");
        if (!"approved".equals(value) && !"pending".equals(value)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Value must be either 'approved' or 'pending'"));
        }

        String key = "default_user_approval";
        return settingsRepository.findByKey(key)
            .map(setting -> {
                setting.setValue(value);
                settingsRepository.save(setting);
                return ResponseEntity.ok(new MessageResponse("Default user approval status updated to " + value));
            })
            .orElseGet(() -> {
                Settings newSetting = Settings.builder()
                    .key(key)
                    .value(value)
                    .description("Default approval status for new registered users")
                    .build();
                settingsRepository.save(newSetting);
                return ResponseEntity.ok(new MessageResponse("Default user approval status set to " + value));
            });
    }

    // --- General Settings ---
    @GetMapping("/settings/general")
    public ResponseEntity<?> getGeneralSettings() {
        Map<String, String> settings = new HashMap<>();
        settings.put("whatsapp_number", settingsRepository.findByKey("whatsapp_number").map(Settings::getValue).orElse(""));
        settings.put("instagram_url", settingsRepository.findByKey("instagram_url").map(Settings::getValue).orElse(""));
        settings.put("linkedin_url", settingsRepository.findByKey("linkedin_url").map(Settings::getValue).orElse(""));
        settings.put("facebook_url", settingsRepository.findByKey("facebook_url").map(Settings::getValue).orElse(""));
        return ResponseEntity.ok(settings);
    }

    @PutMapping("/settings/general")
    public ResponseEntity<?> updateGeneralSettings(@RequestBody Map<String, String> payload) {
        try {
            String[] settingKeys = {"whatsapp_number", "instagram_url", "linkedin_url", "facebook_url"};
            for (String key : settingKeys) {
                String value = payload.get(key);
                if (value != null) {
                    settingsRepository.findByKey(key)
                        .map(setting -> {
                            setting.setValue(value);
                            return settingsRepository.save(setting);
                        })
                        .orElseGet(() -> {
                            Settings newSetting = Settings.builder()
                                .key(key)
                                .value(value)
                                .description("General setting: " + key)
                                .build();
                            return settingsRepository.save(newSetting);
                        });
                }
            }
            return ResponseEntity.ok(new MessageResponse("General settings updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Failed to update general settings: " + e.getMessage()));
        }
    }
}
