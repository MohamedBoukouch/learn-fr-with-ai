package com.eformation.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LevelDetailsResponse {
    private Long id;
    private String name;
    private String color;
    private double overallProgress;
    private List<DomainProgressDTO> domains;
    private List<QuizProgressDTO> quizzes;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class DomainProgressDTO {
        private Long id;
        private String name;
        private String imageUrl;
        private long totalPhrases;
        private long completedPhrases;
        private double progress;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class QuizProgressDTO {
        private Long id;
        private String title;
        private boolean completed;
        private int lastScore;
        private boolean passed;
    }
}
