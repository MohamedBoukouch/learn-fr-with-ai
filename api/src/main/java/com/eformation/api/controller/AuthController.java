package com.eformation.api.controller;

import com.eformation.api.dto.*;
import com.eformation.api.model.Role;
import com.eformation.api.model.User;
import com.eformation.api.repository.UserRepository;
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

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .passwordHash(encoder.encode(signUpRequest.getPassword()))
                .role(Role.LEARNER) // Default role
                .isApproved(false)  // Needs admin approval
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully! Please wait for admin approval."));
    }

    @PostMapping("/test-promote")
    public ResponseEntity<?> promoteUser(@RequestParam String email) {
        return userRepository.findByEmail(email).map(user -> {
            user.setRole(Role.ADMIN);
            user.setApproved(true);
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("User promoted!"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
