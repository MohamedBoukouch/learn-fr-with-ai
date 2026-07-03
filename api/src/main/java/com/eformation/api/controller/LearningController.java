package com.eformation.api.controller;

import com.eformation.api.dto.LevelDetailsResponse;
import com.eformation.api.model.*;
import com.eformation.api.repository.*;
import com.eformation.api.service.LevelService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/learning")
public class LearningController {

    @Autowired
    private LevelRepository levelRepository;

    @Autowired
    private DomainRepository domainRepository;

    @Autowired
    private PhraseRepository phraseRepository;

    @Autowired
    private VocabularyRepository vocabularyRepository;

    @Autowired
    private LevelService levelService;

    // --- Levels ---
    @GetMapping("/levels")
    public List<LevelDetailsResponse> getAllLevels() {
        return levelService.getLevels();
    }

    @PostMapping("/levels")
    @PreAuthorize("hasRole('ADMIN')")
    public Level createLevel(@RequestBody Level level) {
        return levelRepository.save(level);
    }

    // --- Domains ---
    @GetMapping("/levels/{levelId}/domains")
    public List<Domain> getDomainsByLevel(@PathVariable Long levelId) {
        return domainRepository.findByLevelId(levelId);
    }

    @PostMapping("/levels/{levelId}/domains")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Domain> createDomain(@PathVariable Long levelId, @RequestBody Domain domain) {
        return levelRepository.findById(levelId).map(level -> {
            domain.setLevel(level);
            return ResponseEntity.ok(domainRepository.save(domain));
        }).orElse(ResponseEntity.notFound().build());
    }

    // --- Phrases ---
    @GetMapping("/domains/{domainId}/phrases")
    @Transactional(readOnly = true)  // ← AJOUTER CETTE ANNOTATION
    public List<Phrase> getPhrasesByDomain(@PathVariable Long domainId) {
        // Utiliser la nouvelle méthode au lieu de findByDomainIdOrderByOrderIndexAsc
        List<Phrase> phrases = phraseRepository.findByDomainIdWithVocabulary(domainId);
        
        // Force l'initialisation pour être sûr
        phrases.forEach(phrase -> {
            if (phrase.getVocabularyList() != null) {
                phrase.getVocabularyList().size();
            }
        });
        
        return phrases;
    }

    @PostMapping("/domains/{domainId}/phrases")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Phrase> createPhrase(@PathVariable Long domainId, @RequestBody Phrase phrase) {
        return domainRepository.findById(domainId).map(domain -> {
            phrase.setDomain(domain);
            Phrase savedPhrase = phraseRepository.save(phrase);
            
            // Link vocabulary if provided
            if (phrase.getVocabularyList() != null) {
                phrase.getVocabularyList().forEach(v -> {
                    v.setPhrase(savedPhrase);
                    vocabularyRepository.save(v);
                });
            }
            
            return ResponseEntity.ok(savedPhrase);
        }).orElse(ResponseEntity.notFound().build());
    }
}
