package com.eformation.api;

import com.eformation.api.model.Level;
import com.eformation.api.model.Question;
import com.eformation.api.model.Quiz;
import com.eformation.api.model.Role;
import com.eformation.api.model.User;
import com.eformation.api.repository.DomainRepository;
import com.eformation.api.repository.LevelRepository;
import com.eformation.api.repository.QuizRepository;
import com.eformation.api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@SpringBootApplication
public class ApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiApplication.class, args);
	}

	@Bean
	CommandLineRunner init(UserRepository userRepository, 
						   com.eformation.api.repository.LevelRepository levelRepository,
						   com.eformation.api.repository.DomainRepository domainRepository,
						   QuizRepository quizRepository,
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

            seedLevelQuizzes(levelRepository, quizRepository);
		};
	}

    private void seedLevelQuizzes(com.eformation.api.repository.LevelRepository levelRepository, QuizRepository quizRepository) {
        List<com.eformation.api.model.Level> levels = levelRepository.findAll();
        for (com.eformation.api.model.Level level : levels) {
            if ("A1".equals(level.getName())) {
                continue;
            }

            List<com.eformation.api.model.Quiz> existingQuizzes = quizRepository.findByLevelId(level.getId());
            int existingCount = existingQuizzes == null ? 0 : existingQuizzes.size();
            if (existingCount >= 5) {
                continue;
            }

            List<com.eformation.api.model.Quiz> newQuizzes = createQuizzesForLevel(level, existingCount + 1, 5 - existingCount);
            if (!newQuizzes.isEmpty()) {
                quizRepository.saveAll(newQuizzes);
                System.out.println("Seeded " + newQuizzes.size() + " quizzes for level " + level.getName());
            }
        }
    }

    private List<com.eformation.api.model.Quiz> createQuizzesForLevel(com.eformation.api.model.Level level, int startNumber, int count) {
        String levelName = level.getName();
        List<com.eformation.api.model.Quiz> quizzes = java.util.Collections.emptyList();

        if ("Pre-A1".equals(levelName)) {
            quizzes = createPreA1Quizzes(level, startNumber, count);
        } else if ("A2".equals(levelName)) {
            quizzes = createA2Quizzes(level, startNumber, count);
        } else if ("B1".equals(levelName)) {
            quizzes = createB1Quizzes(level, startNumber, count);
        } else if ("B2".equals(levelName)) {
            quizzes = createB2Quizzes(level, startNumber, count);
        } else if ("C1".equals(levelName)) {
            quizzes = createC1Quizzes(level, startNumber, count);
        } else if ("C2".equals(levelName)) {
            quizzes = createC2Quizzes(level, startNumber, count);
        }

        return quizzes;
    }

    private List<com.eformation.api.model.Quiz> createPreA1Quizzes(com.eformation.api.model.Level level, int startNumber, int count) {
        List<com.eformation.api.model.Quiz> quizzes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            int quizNumber = startNumber + i;
            quizzes.add(createQuiz(level, "Quiz " + quizNumber + " - Salutations et expressions simples", List.of(
                createQuestion("Quelle phrase utilise-t-on pour dire bonjour en français ?", "Bonjour", List.of("Bonjour", "Merci", "Au revoir", "S'il vous plaît")),
                createQuestion("Quelle phrase correspond à un remerciement ?", "Merci", List.of("Merci", "Pardon", "Salut", "Bonsoir")),
                createQuestion("Comment répond-on quand on quitte quelqu'un ?", "Au revoir", List.of("Au revoir", "Bonjour", "S'il vous plaît", "Merci")),
                createQuestion("Quelle expression signifie 'please' en français ?", "S'il vous plaît", List.of("S'il vous plaît", "Je t'aime", "Je ne sais pas", "Bonne nuit"))
            )));
        }
        return quizzes;
    }

    private List<com.eformation.api.model.Quiz> createA2Quizzes(com.eformation.api.model.Level level, int startNumber, int count) {
        List<com.eformation.api.model.Quiz> quizzes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            int quizNumber = startNumber + i;
            quizzes.add(createQuiz(level, "Quiz " + quizNumber + " - Vie quotidienne et achats", List.of(
                createQuestion("Que dit-on pour demander une information poliment ?", "Excusez-moi", List.of("Excusez-moi", "Je vous en prie", "Enchanté", "Merci")),
                createQuestion("Quelle phrase utilise-t-on pour demander le prix ?", "C'est combien ?", List.of("C'est combien ?", "Je vais bien", "Où est la gare ?", "À bientôt")),
                createQuestion("Que veut dire 'Je voudrais' ?", "Je veux", List.of("Je veux", "Je peux", "Je dois", "Je sais")),
                createQuestion("Quelle phrase exprime un besoin d'aide ?", "Pouvez-vous m'aider ?", List.of("Pouvez-vous m'aider ?", "Je suis fatigué", "J'ai faim", "Je suis d'accord"))
            )));
        }
        return quizzes;
    }

    private List<com.eformation.api.model.Quiz> createB1Quizzes(com.eformation.api.model.Level level, int startNumber, int count) {
        List<com.eformation.api.model.Quiz> quizzes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            int quizNumber = startNumber + i;
            quizzes.add(createQuiz(level, "Quiz " + quizNumber + " - Communication et opinions", List.of(
                createQuestion("Que signifie 'Je suis d'accord' ?", "Je partage la même opinion", List.of("Je partage la même opinion", "Je refuse", "Je suis désolé", "Je ne comprends pas")),
                createQuestion("Quelle phrase exprime un regret ?", "Je suis désolé", List.of("Je suis désolé", "Je suis en retard", "Je suis content", "Je suis prêt")),
                createQuestion("Comment formule-t-on une suggestion ?", "Et si nous allions au cinéma ?", List.of("Et si nous allions au cinéma ?", "Je vais au cinéma", "Je n'aime pas le cinéma", "Je dois travailler")),
                createQuestion("Quelle phrase décrit une habitude régulière ?", "Je me lève à sept heures", List.of("Je me lève à sept heures", "Je suis levé maintenant", "Je vais me lever plus tard", "Je me suis levé tôt"))
            )));
        }
        return quizzes;
    }

    private List<com.eformation.api.model.Quiz> createB2Quizzes(com.eformation.api.model.Level level, int startNumber, int count) {
        List<com.eformation.api.model.Quiz> quizzes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            int quizNumber = startNumber + i;
            quizzes.add(createQuiz(level, "Quiz " + quizNumber + " - Expression et nuances", List.of(
                createQuestion("Quel verbe utilise-t-on pour exprimer un souhait ?", "J'aimerais", List.of("J'aimerais", "Je dois", "Je peux", "Je sais")),
                createQuestion("Que signifie 'Malheureusement' ?", "C'est regrettable", List.of("C'est regrettable", "C'est agréable", "C'est certain", "C'est possible")),
                createQuestion("Quelle phrase correspond à une opinion nuancée ?", "À mon avis, c'est possible", List.of("À mon avis, c'est possible", "C'est impossible", "Je n'ai pas d'avis", "Je suis certain")),
                createQuestion("Quelle phrase décrit un progrès ?", "J'ai amélioré mon français", List.of("J'ai amélioré mon français", "J'améliore mon français", "Je suis amélioré", "Je veux apprendre"))
            )));
        }
        return quizzes;
    }

    private List<com.eformation.api.model.Quiz> createC1Quizzes(com.eformation.api.model.Level level, int startNumber, int count) {
        List<com.eformation.api.model.Quiz> quizzes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            int quizNumber = startNumber + i;
            quizzes.add(createQuiz(level, "Quiz " + quizNumber + " - Argumentation et complexité", List.of(
                createQuestion("Que signifie 'Néanmoins' ?", "Cependant", List.of("Cependant", "À cause de", "Puisque", "Par conséquent")),
                createQuestion("Quelle phrase est une hypothèse ?", "Si j'avais plus de temps, je voyagerais", List.of("Si j'avais plus de temps, je voyagerais", "J'avais plus de temps hier", "Je voyagerai demain", "Je ne voyagerai pas")),
                createQuestion("Quelle phrase exprime une conséquence ?", "Par conséquent, j'ai pris une décision", List.of("Par conséquent, j'ai pris une décision", "Car je suis fatigué", "Malgré tout, j'ai continué", "Afin de progresser")),
                createQuestion("Quel mot introduit une concession ?", "Bien que", List.of("Bien que", "Parce que", "Quand", "Donc"))
            )));
        }
        return quizzes;
    }

    private List<com.eformation.api.model.Quiz> createC2Quizzes(com.eformation.api.model.Level level, int startNumber, int count) {
        List<com.eformation.api.model.Quiz> quizzes = new java.util.ArrayList<>();
        for (int i = 0; i < count; i++) {
            int quizNumber = startNumber + i;
            quizzes.add(createQuiz(level, "Quiz " + quizNumber + " - Maîtrise avancée du français", List.of(
                createQuestion("Que signifie 'D'autant plus que' ?", "Surtout parce que", List.of("Surtout parce que", "Moins que", "En dépit de", "Avant que")),
                createQuestion("Quelle phrase exprime une nuance complexe ?", "Il est vrai que ce sujet est délicat", List.of("Il est vrai que ce sujet est délicat", "Ce sujet est facile", "Je ne parle pas de ce sujet", "Ce sujet est ignoré")),
                createQuestion("Quel terme traduit une certitude modérée ?", "Il semble que", List.of("Il semble que", "Il est certain que", "Il est obligatoire que", "Il est impossible que")),
                createQuestion("Quelle expression signifie 'en fin de compte' ?", "Au final", List.of("Au final", "Au début", "À moitié", "À la fois"))
            )));
        }
        return quizzes;
    }

    private com.eformation.api.model.Quiz createQuiz(com.eformation.api.model.Level level, String title, List<com.eformation.api.model.Question> questions) {
        com.eformation.api.model.Quiz quiz = com.eformation.api.model.Quiz.builder()
                .title(title)
                .questions(questions)
                .level(level)
                .build();
        for (com.eformation.api.model.Question question : questions) {
            question.setQuiz(quiz);
        }
        return quiz;
    }

    private com.eformation.api.model.Question createQuestion(String frenchText, String correctAnswer, List<String> options) {
        return com.eformation.api.model.Question.builder()
                .frenchText(frenchText)
                .correctAnswer(correctAnswer)
                .options(options)
                .type(com.eformation.api.model.Question.QuestionType.MCQ)
                .build();
    }

}