package com.eformation.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentStatsResponse {
    private long totalDomains;
    private long completedDomains;
    private int totalPoints;
    private int currentStreak;
    private Map<String, Object> lastActivity;
    private Map<Long, Double> levelProgress;
}
