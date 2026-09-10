package com.eformation.api.controller;

import com.eformation.api.dto.MessageResponse;
import com.eformation.api.model.User;
import com.eformation.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private UserRepository userRepository;

    @PutMapping("/users/{id}/emma-access/plan")
    public ResponseEntity<?> updateUserEmmaAccessPlanForTest(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        return userRepository.findById(id).map(user -> {
            if (payload.containsKey("enabled")) {
                user.setEmmaAccess(Boolean.parseBoolean(payload.get("enabled").toString()));
            }
            if (payload.containsKey("startDate") && payload.get("startDate") != null && !payload.get("startDate").toString().isBlank()) {
                user.setEmmaAccessStartDate(LocalDate.parse(payload.get("startDate").toString()));
            }
            if (payload.containsKey("endDate") && payload.get("endDate") != null && !payload.get("endDate").toString().isBlank()) {
                user.setEmmaAccessEndDate(LocalDate.parse(payload.get("endDate").toString()));
            }
            if (payload.containsKey("revoked")) {
                user.setEmmaAccessRevoked(Boolean.parseBoolean(payload.get("revoked").toString()));
            }
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Test EMMA access plan updated successfully"));
        }).orElse(ResponseEntity.status(404).body(new MessageResponse("User not found with ID: " + id)));
    }
}
