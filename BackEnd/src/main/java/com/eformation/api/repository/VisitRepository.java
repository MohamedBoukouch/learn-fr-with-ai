package com.eformation.api.repository;

import com.eformation.api.model.Visit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface VisitRepository extends JpaRepository<Visit, Long> {

    // ============ VISITES (pages vues) ============
    
    long count();

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.visitDate >= :since")
    long countSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.visitDate >= :since AND v.isAuthenticated = true")
    long countAuthenticatedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(v) FROM Visit v WHERE v.visitDate >= :since AND v.isAuthenticated = false")
    long countAnonymousSince(@Param("since") LocalDateTime since);

    // ============ VISITEURS UNIQUES ============
    
    // Visiteurs uniques par session (tout le monde)
    @Query("SELECT COUNT(DISTINCT v.sessionId) FROM Visit v WHERE v.visitDate >= :since")
    long countUniqueSessionsSince(@Param("since") LocalDateTime since);

    // Visiteurs uniques par fingerprint (anonymes)
    @Query("SELECT COUNT(DISTINCT v.visitorFingerprint) FROM Visit v " +
           "WHERE v.visitDate >= :since AND v.isAuthenticated = false AND v.visitorFingerprint IS NOT NULL")
    long countUniqueAnonymousVisitorsSince(@Param("since") LocalDateTime since);

    // Utilisateurs connectés uniques
    @Query("SELECT COUNT(DISTINCT v.user.id) FROM Visit v " +
           "WHERE v.visitDate >= :since AND v.isAuthenticated = true")
    long countUniqueAuthenticatedUsersSince(@Param("since") LocalDateTime since);

    // ============ TEMPS ============
    
    @Query("SELECT COALESCE(AVG(v.durationSeconds), 0) FROM Visit v")
    Double getAverageDuration();

    @Query("SELECT COALESCE(AVG(v.durationSeconds), 0) FROM Visit v WHERE v.isAuthenticated = true")
    Double getAverageDurationAuthenticated();

    @Query("SELECT COALESCE(AVG(v.durationSeconds), 0) FROM Visit v WHERE v.isAuthenticated = false")
    Double getAverageDurationAnonymous();

    @Query("SELECT COALESCE(SUM(v.durationSeconds), 0) FROM Visit v")
    Long getTotalDuration();

    // ============ PAGES ============
    
    @Query("SELECT v.page, COUNT(v) FROM Visit v GROUP BY v.page ORDER BY COUNT(v) DESC")
    List<Object[]> getTopPages();

    @Query("SELECT v.page, COUNT(v) FROM Visit v WHERE v.visitDate >= :since GROUP BY v.page ORDER BY COUNT(v) DESC")
    List<Object[]> getTopPagesSince(@Param("since") LocalDateTime since);

    // ============ PAR JOUR ============
    
    @Query("SELECT FUNCTION('DATE', v.visitDate), COUNT(v), " +
           "COUNT(DISTINCT v.sessionId), " +
           "COUNT(DISTINCT CASE WHEN v.isAuthenticated = false THEN v.visitorFingerprint END), " +
           "COUNT(DISTINCT CASE WHEN v.isAuthenticated = true THEN v.user.id END) " +
           "FROM Visit v WHERE v.visitDate >= :since " +
           "GROUP BY FUNCTION('DATE', v.visitDate) " +
           "ORDER BY FUNCTION('DATE', v.visitDate) ASC")
    List<Object[]> getDailyStats(@Param("since") LocalDateTime since);

    // ============ APPAREILS ============
    
    @Query("SELECT v.deviceType, COUNT(v) FROM Visit v WHERE v.visitDate >= :since " +
           "GROUP BY v.deviceType ORDER BY COUNT(v) DESC")
    List<Object[]> getDeviceStats(@Param("since") LocalDateTime since);

    // ============ REFERRERS ============
    
    @Query("SELECT v.referrer, COUNT(v) FROM Visit v " +
           "WHERE v.visitDate >= :since AND v.referrer IS NOT NULL " +
           "GROUP BY v.referrer ORDER BY COUNT(v) DESC")
    List<Object[]> getTopReferrers(@Param("since") LocalDateTime since);
}