package com.eformation.api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eformation.api.dto.LevelDetailsResponse;
import com.eformation.api.model.Level;
import com.eformation.api.repository.LevelRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LevelService {

    private final LevelRepository levelRepository;

    public List<LevelDetailsResponse> getLevels() {

        List<Level> levels = levelRepository.findAllWithDomains();

        return levels.stream()
                .map(this::toDto)
                .toList();
    }

    private LevelDetailsResponse toDto(Level level) {
        return LevelDetailsResponse.builder()
                .id(level.getId())
                .name(level.getName())
                .color(level.getColor())
                .domains(
                        level.getDomains().stream().map(d ->
                                LevelDetailsResponse.DomainProgressDTO.builder()
                                        .id(d.getId())
                                        .name(d.getName())
                                        .imageUrl(d.getImageUrl())
                                        .totalPhrases(
                                                d.getPhrases() == null ? 0 : d.getPhrases().size()
                                        )
                                        .completedPhrases(0) // à calculer plus tard
                                        .progress(0)
                                        .build()
                        ).toList()
                )
                .quizzes(List.of())
                .overallProgress(0)
                .build();
    }
}
