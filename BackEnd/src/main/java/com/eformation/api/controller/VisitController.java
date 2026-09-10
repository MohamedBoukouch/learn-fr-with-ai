package com.eformation.api.controller;

import com.eformation.api.model.Visit;
import com.eformation.api.model.User;
import com.eformation.api.repository.VisitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/tracking")
public class VisitController {

    @Autowired
    private VisitRepository visitRepository;

    // Enregistrer une visite (pour TOUS : anonymes ET connectés)
    @PostMapping("/visit")
    public ResponseEntity<?> recordVisit(@RequestBody Map<String, Object> payload,
                                          HttpServletRequest request) {
        String page = (String) payload.getOrDefault("page", "unknown");
        String sessionId = (String) payload.getOrDefault("sessionId", UUID.randomUUID().toString());
        Integer duration = (Integer) payload.getOrDefault("duration", 0);
        String fingerprint = (String) payload.getOrDefault("fingerprint", null);
        String referrer = (String) payload.getOrDefault("referrer", 
                              request.getHeader("Referer"));
        String deviceType = (String) payload.getOrDefault("deviceType", "unknown");
        String browser = (String) payload.getOrDefault("browser", "unknown");

        // Vérifier si l'utilisateur est connecté
        User user = null;
        boolean isAuthenticated = false;
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof User) {
                user = (User) principal;
                isAuthenticated = true;
            }
        } catch (Exception e) {
            // Utilisateur anonyme
        }

        Visit visit = Visit.builder()
                .page(page)
                .sessionId(sessionId)
                .visitorFingerprint(fingerprint)
                .user(user)
                .isAuthenticated(isAuthenticated)
                .durationSeconds(duration)
                .referrer(referrer)
                .deviceType(deviceType)
                .browser(browser)
                .build();

        visitRepository.save(visit);

        return ResponseEntity.ok(Map.of("status", "recorded"));
    }

// Statistiques complètes pour le dashboard admin
@GetMapping("/stats")
public ResponseEntity<Map<String, Object>> getStats() {
    LocalDateTime last30Days = LocalDateTime.now().minusDays(30);
    LocalDateTime last7Days = LocalDateTime.now().minusDays(7);
    LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

    // ============ VISITES (pages vues) ============
    long totalVisits = visitRepository.count();
    long visits7d = visitRepository.countSince(last7Days);
    long visits30d = visitRepository.countSince(last30Days);
    long visitsToday = visitRepository.countSince(today);
    long visitsAuth30d = visitRepository.countAuthenticatedSince(last30Days);
    long visitsAnon30d = visitRepository.countAnonymousSince(last30Days);

    // ============ VISITEURS UNIQUES ============
    long uniqueSessions30d = visitRepository.countUniqueSessionsSince(last30Days);
    long uniqueAnonymous30d = visitRepository.countUniqueAnonymousVisitorsSince(last30Days);
    long uniqueUsers30d = visitRepository.countUniqueAuthenticatedUsersSince(last30Days);

    // ============ TEMPS ============
    double avgDuration = visitRepository.getAverageDuration();
    double avgDurationAuth = visitRepository.getAverageDurationAuthenticated();
    double avgDurationAnon = visitRepository.getAverageDurationAnonymous();
    long totalDuration = visitRepository.getTotalDuration();

    // ============ PAR JOUR ============
    List<Object[]> dailyStats = visitRepository.getDailyStats(last30Days);
    List<Map<String, Object>> dailyData = new ArrayList<>();
    for (Object[] row : dailyStats) {
        dailyData.add(Map.of(
            "date", row[0].toString(),
            "visits", row[1],
            "uniqueSessions", row[2],
            "uniqueAnonymous", row[3],
            "uniqueUsers", row[4]
        ));
    }

    // ============ TOP PAGES ============
    List<Object[]> topPages = visitRepository.getTopPagesSince(last30Days);
    List<Map<String, Object>> topPagesData = new ArrayList<>();
    for (Object[] row : topPages) {
        topPagesData.add(Map.of("page", row[0], "count", row[1]));
    }

    // ============ APPAREILS ============
    List<Object[]> devices = visitRepository.getDeviceStats(last30Days);
    Map<String, Long> deviceData = new HashMap<>();
    for (Object[] row : devices) {
        deviceData.put((String) row[0], (Long) row[1]);
    }

    // ============ REFERRERS ============
    List<Object[]> referrers = visitRepository.getTopReferrers(last30Days);
    Map<String, Long> referrerData = new HashMap<>();
    for (Object[] row : referrers) {
        referrerData.put((String) row[0], (Long) row[1]);
    }

    // ============ CONSTRUIRE LA RÉPONSE ============
    Map<String, Object> result = new HashMap<>();
    
    // Visites
    result.put("visitsToday", visitsToday);
    result.put("visits7Days", visits7d);
    result.put("visits30Days", visits30d);
    result.put("totalVisits", totalVisits);
    result.put("visitsAuthenticated30d", visitsAuth30d);
    result.put("visitsAnonymous30d", visitsAnon30d);

    // Visiteurs uniques
    result.put("uniqueVisitors30d", uniqueSessions30d);
    result.put("uniqueAnonymous30d", uniqueAnonymous30d);
    result.put("uniqueUsers30d", uniqueUsers30d);

    // Temps
    result.put("avgDurationSeconds", Math.round(avgDuration));
    result.put("avgDurationFormatted", formatDuration((long) avgDuration));
    result.put("avgDurationAuth", formatDuration((long) avgDurationAuth));
    result.put("avgDurationAnon", formatDuration((long) avgDurationAnon));
    result.put("totalDurationFormatted", formatDuration(totalDuration));

    // Données détaillées
    result.put("dailyStats", dailyData);
    result.put("topPages", topPagesData);
    result.put("devices", deviceData);
    result.put("referrers", referrerData);

    return ResponseEntity.ok(result);
}
    private String formatDuration(long seconds) {
        if (seconds < 60) return seconds + "s";
        long minutes = seconds / 60;
        long remSeconds = seconds % 60;
        if (minutes < 60) return minutes + "m " + remSeconds + "s";
        long hours = minutes / 60;
        long remMinutes = minutes % 60;
        return hours + "h " + remMinutes + "m";
    }
}