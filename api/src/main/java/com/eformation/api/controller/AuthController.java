package com.eformation.api.controller;

import com.eformation.api.dto.*;
import com.eformation.api.model.Role;
import com.eformation.api.model.User;
import com.eformation.api.model.Settings;
import com.eformation.api.repository.UserRepository;
import com.eformation.api.repository.SettingsRepository;
import com.eformation.api.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    SettingsRepository settingsRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.isApproved() && user.getRole() != Role.ADMIN) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Your account is pending admin approval."));
        }

        List<String> roles = user.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 user.getId(), 
                                                 user.getName(), 
                                                 user.getEmail(), 
                                                 roles,
                                                 user.isApproved()));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Get default approval status from settings
        boolean defaultApproved = settingsRepository.findByKey("default_user_approval")
            .map(setting -> "approved".equals(setting.getValue()))
            .orElse(false);

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .role(Role.LEARNER) // Default role
                .isApproved(defaultApproved)  // Use setting or default to pending
                .build();

        userRepository.save(user);

        String message = defaultApproved
            ? "User registered successfully! You can now log in."
            : "User registered successfully! Please wait for admin approval.";

        return ResponseEntity.ok(new MessageResponse(message));
    }
}
