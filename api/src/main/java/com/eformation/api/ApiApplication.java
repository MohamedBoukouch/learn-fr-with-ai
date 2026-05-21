package com.eformation.api;

import com.eformation.api.model.Role;
import com.eformation.api.model.User;
import com.eformation.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class ApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository, 
						   com.eformation.api.repository.LevelRepository levelRepository,
						   com.eformation.api.repository.DomainRepository domainRepository,
						   PasswordEncoder passwordEncoder) {
		return args -> {
			// 1. Create Admin
			String adminEmail = "amarjaneelmahdi03@gmail.com";
			if (userRepository.findByEmail(adminEmail).isEmpty()) {
				User admin = User.builder()
						.name("Admin")
						.email(adminEmail)
						.passwordHash(passwordEncoder.encode(adminEmail))
						.role(Role.ADMIN)
						.isApproved(true)
						.build();
				userRepository.save(admin);
				System.out.println("Admin user created");
			}

			// 2. Create Levels if empty
			if (levelRepository.count() == 0) {
				com.eformation.api.model.Level preA1 = levelRepository.save(
					com.eformation.api.model.Level.builder().name("Pre-A1").color("#EC4899").orderIndex(0).build()
				);
				com.eformation.api.model.Level a1 = levelRepository.save(
					com.eformation.api.model.Level.builder().name("A1").color("#3B82F6").orderIndex(1).build()
				);
				levelRepository.save(com.eformation.api.model.Level.builder().name("A2").color("#10B981").orderIndex(2).build());
				levelRepository.save(com.eformation.api.model.Level.builder().name("B1").color("#F59E0B").orderIndex(3).build());
				levelRepository.save(com.eformation.api.model.Level.builder().name("B2").color("#F97316").orderIndex(4).build());
				levelRepository.save(com.eformation.api.model.Level.builder().name("C1").color("#8B5CF6").orderIndex(5).build());
				levelRepository.save(com.eformation.api.model.Level.builder().name("C2").color("#FFD700").orderIndex(6).build());
				
				// 3. Create initial Domains for A1
				domainRepository.save(com.eformation.api.model.Domain.builder()
					.name("Voyage")
					.level(a1)
					.build());
				domainRepository.save(com.eformation.api.model.Domain.builder()
					.name("Famille")
					.level(a1)
					.build());
				domainRepository.save(com.eformation.api.model.Domain.builder()
					.name("Travail")
					.level(a1)
					.build());
				
				System.out.println("Database seeded with Levels and Domains");
			}
		};
	}
}
