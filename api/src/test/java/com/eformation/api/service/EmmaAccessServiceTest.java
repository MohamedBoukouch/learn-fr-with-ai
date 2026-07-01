package com.eformation.api.service;

import com.eformation.api.model.Role;
import com.eformation.api.model.User;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmmaAccessServiceTest {

    private final EmmaAccessService emmaAccessService = new EmmaAccessService();

    @Test
    void shouldAllowAccessWhenEnabledWithinActivePeriod() {
        User user = User.builder()
                .role(Role.LEARNER)
                .emmaAccess(true)
                .emmaAccessStartDate(LocalDate.now().minusDays(1))
                .emmaAccessEndDate(LocalDate.now().plusDays(5))
                .emmaAccessRevoked(false)
                .build();

        assertTrue(emmaAccessService.canAccessEmma(user));
    }

    @Test
    void shouldDenyAccessWhenRevokedByAdmin() {
        User user = User.builder()
                .role(Role.LEARNER)
                .emmaAccess(true)
                .emmaAccessStartDate(LocalDate.now().minusDays(1))
                .emmaAccessEndDate(LocalDate.now().plusDays(5))
                .emmaAccessRevoked(true)
                .build();

        assertFalse(emmaAccessService.canAccessEmma(user));
    }

    @Test
    void shouldDenyAccessWhenPeriodHasExpired() {
        User user = User.builder()
                .role(Role.LEARNER)
                .emmaAccess(true)
                .emmaAccessStartDate(LocalDate.now().minusDays(10))
                .emmaAccessEndDate(LocalDate.now().minusDays(1))
                .emmaAccessRevoked(false)
                .build();

        assertFalse(emmaAccessService.canAccessEmma(user));
    }
}
