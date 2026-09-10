package com.eformation.api;

import com.eformation.api.model.Level;
import com.eformation.api.model.Domain;
import com.eformation.api.model.Phrase;
import com.eformation.api.model.Vocabulary;
import com.eformation.api.model.Quiz;
import com.eformation.api.model.Question;
import com.eformation.api.repository.LevelRepository;
import com.eformation.api.repository.DomainRepository;
import com.eformation.api.repository.PhraseRepository;
import com.eformation.api.repository.VocabularyRepository;
import com.eformation.api.repository.QuizRepository;
import com.eformation.api.service.AiService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@SpringBootTest
class ApiApplicationTests {

	@Autowired
	private LevelRepository levelRepository;

	@Autowired
	private DomainRepository domainRepository;

	@Autowired
	private PhraseRepository phraseRepository;

	@Autowired
	private VocabularyRepository vocabularyRepository;

	@Autowired
	private AiService aiService;

	@Autowired
	private QuizRepository quizRepository;

	@Test
	void testRawGeminiCall() {
		try {
			org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
			org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
			headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
			
			String prompt = "Generate 30 practical French phrases for a learner at level A2 in the domain of 'Voyages et vacances'. \n" +
				"CRITICAL: All phrases and vocabulary must be in FRENCH. Use formal ARABIC only for translations and meanings.\n" +
				"Existing phrases (DO NOT DUPLICATE): None\n" +
				"Format the output as a clean JSON array of objects: \n" +
				"[{\n" +
				"  \"frenchText\": \"...\", \n" +
				"  \"arabicTranslation\": \"...\", \n" +
				"  \"vocabularyList\": [{\"frenchWord\": \"...\", \"arabicMeaning\": \"...\"}]\n" +
				"}] \n" +
				"IMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanation.";

			java.util.Map<String, Object> requestBody = java.util.Map.of(
				"contents", new Object[]{
					java.util.Map.of("parts", new Object[]{
						java.util.Map.of("text", prompt)
					})
				}
			);
			org.springframework.http.HttpEntity<java.util.Map<String, Object>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);
			String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=AIzaSyCBefvvYyBBItYWwNuBaf3X1-mViUUR7go";
			org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
			System.out.println("=== RAW GEMINI RESPONSE ===");
			System.out.println("Status: " + response.getStatusCode());
			System.out.println("Body: " + response.getBody());
			System.out.println("===========================");
		} catch (org.springframework.web.client.HttpStatusCodeException se) {
			System.out.println("=== RAW GEMINI ERROR RESPONSE ===");
			System.out.println("Status: " + se.getStatusCode());
			System.out.println("Body: " + se.getResponseBodyAsString());
			System.out.println("=================================");
		} catch (Exception e) {
			System.out.println("=== RAW GEMINI GENERAL ERROR ===");
			e.printStackTrace();
			System.out.println("================================");
		}
	}

	public static class PhraseDto {
		public String frenchText;
		public String arabicTranslation;
		public List<VocabularyDto> vocabularyList;
	}

	public static class VocabularyDto {
		public String frenchWord;
		public String arabicMeaning;
	}

	public static class QuestionDto {
		public String frenchText;
		public String type;
		public List<String> options;
		public String correctAnswer;
	}

	private List<QuestionDto> parseQuestions(String jsonStr) {
		if (jsonStr == null || jsonStr.trim().isEmpty()) {
			return List.of();
		}
		try {
			int start = jsonStr.indexOf('[');
			int end = jsonStr.lastIndexOf(']');
			if (start != -1 && end != -1 && end > start) {
				jsonStr = jsonStr.substring(start, end + 1);
			}
			ObjectMapper mapper = new ObjectMapper();
			return mapper.readValue(jsonStr, new TypeReference<List<QuestionDto>>() {});
		} catch (Exception e) {
			System.err.println("JSON parse failed: " + e.getMessage());
			System.err.println("Raw response was:\n" + jsonStr);
			return List.of();
		}
	}

	private static class DomainInfo {
		String name;
		String icon;
		DomainInfo(String name, String icon) {
			this.name = name;
			this.icon = icon;
		}
	}

	private List<PhraseDto> parsePhrases(String jsonStr) {
		if (jsonStr == null || jsonStr.trim().isEmpty()) {
			return List.of();
		}
		try {
			int start = jsonStr.indexOf('[');
			int end = jsonStr.lastIndexOf(']');
			if (start != -1 && end != -1 && end > start) {
				jsonStr = jsonStr.substring(start, end + 1);
			}
			ObjectMapper mapper = new ObjectMapper();
			return mapper.readValue(jsonStr, new TypeReference<List<PhraseDto>>() {});
		} catch (Exception e) {
			System.err.println("JSON parse failed: " + e.getMessage());
			System.err.println("Raw response was:\n" + jsonStr);
			return List.of();
		}
	}

	@Test
	void enrichDbA1() {
		// Find Level A1
		Level a1Level = levelRepository.findAll().stream()
				.filter(l -> l.getName().equalsIgnoreCase("A1"))
				.findFirst()
				.orElseThrow(() -> new RuntimeException("Level A1 not found"));

		System.out.println("Found Level A1 (ID: " + a1Level.getId() + ")");

		// Define the 10 domains to enrich/add
		List<DomainInfo> targetDomains = List.of(
				new DomainInfo("Salutations et présentations", "User"),
				new DomainInfo("Alimentation et boissons", "Utensils"),
				new DomainInfo("Maison et logement", "Home"),
				new DomainInfo("Loisirs et sports", "Activity"),
				new DomainInfo("Routine et temps", "Clock"),
				new DomainInfo("Achats et argent", "ShoppingBag"),
				new DomainInfo("Météo et saisons", "CloudSun"),
				new DomainInfo("Corps et santé", "Heart"),
				new DomainInfo("Ville et transports", "MapPin"),
				new DomainInfo("Vêtements et apparence", "Shirt")
		);

		for (DomainInfo target : targetDomains) {
			// Find or create domain
			Domain domain = domainRepository.findByLevelId(a1Level.getId()).stream()
					.filter(d -> d.getName().equalsIgnoreCase(target.name))
					.findFirst()
					.orElse(null);

			if (domain == null) {
				System.out.println("Creating new domain: " + target.name);
				domain = Domain.builder()
						.name(target.name)
						.icon(target.icon)
						.level(a1Level)
						.build();
				domain = domainRepository.save(domain);
			} else {
				System.out.println("Domain already exists: " + target.name + " (ID: " + domain.getId() + ")");
			}

			// Check current phrase count
			long existingCount = phraseRepository.countByDomainId(domain.getId());
			System.out.println("Domain '" + target.name + "' has " + existingCount + " phrases. Target is 60.");

			if (existingCount >= 60) {
				System.out.println("Skipping domain: " + target.name + " (Already has 60 or more phrases)");
				continue;
			}

			int currentCount = (int) existingCount;
			int targetCount = 60;
			int batchSize = 15;

			while (currentCount < targetCount) {
				int phrasesNeeded = Math.min(batchSize, targetCount - currentCount);
				System.out.println("Generating batch of " + phrasesNeeded + " phrases for domain '" + target.name + "'...");

				// Fetch existing phrases to prevent duplicates
				List<String> existingPhrases = phraseRepository.findByDomainIdOrderByOrderIndexAsc(domain.getId()).stream()
						.map(Phrase::getFrenchText)
						.collect(Collectors.toList());

				String prompt = aiService.getPhraseGenerationPrompt(
						domain.getName(),
						"A1",
						phrasesNeeded,
						existingPhrases,
						"Make sure phrases are extremely simple, suitable for a beginner at CEFR A1 level. Avoid long sentences. Use clear, formal Arabic translations. Keep the style natural."
				);

				String response = aiService.generateContent(prompt);
				List<PhraseDto> phraseDtos = parsePhrases(response);

				if (phraseDtos.isEmpty()) {
					System.err.println("Failed to generate/parse phrases for domain '" + target.name + "', retrying batch...");
					try {
						Thread.sleep(10000);
					} catch (InterruptedException ie) {
						Thread.currentThread().interrupt();
					}
					continue;
				}

				int savedInBatch = 0;
				for (PhraseDto dto : phraseDtos) {
					if (dto.frenchText == null || dto.frenchText.trim().isEmpty()) {
						continue;
					}

					// Verify double-check no duplication
					String cleanFrench = dto.frenchText.trim();
					boolean exists = phraseRepository.findByDomainIdOrderByOrderIndexAsc(domain.getId()).stream()
							.anyMatch(p -> p.getFrenchText().equalsIgnoreCase(cleanFrench));

					if (exists) {
						System.out.println("  Skipping duplicate phrase: " + cleanFrench);
						continue;
					}

					// Save Phrase
					Phrase phrase = Phrase.builder()
							.frenchText(cleanFrench)
							.arabicTranslation(dto.arabicTranslation != null ? dto.arabicTranslation.trim() : "")
							.domain(domain)
							.orderIndex(currentCount)
							.build();

					Phrase savedPhrase = phraseRepository.save(phrase);
					currentCount++;
					savedInBatch++;

					// Save Vocabulary
					if (dto.vocabularyList != null) {
						for (VocabularyDto vDto : dto.vocabularyList) {
							if (vDto.frenchWord == null || vDto.frenchWord.trim().isEmpty()) {
								continue;
							}
							Vocabulary vocab = Vocabulary.builder()
									.frenchWord(vDto.frenchWord.trim())
									.arabicMeaning(vDto.arabicMeaning != null ? vDto.arabicMeaning.trim() : "")
									.phrase(savedPhrase)
									.build();
							vocabularyRepository.save(vocab);
						}
					}
				}

				System.out.println("Saved " + savedInBatch + " phrases in this batch. Current count in domain: " + currentCount);

				// Brief delay between batches to respect API rate limits
				try {
					Thread.sleep(8000);
				} catch (InterruptedException ie) {
					Thread.currentThread().interrupt();
				}
			}

			System.out.println("Successfully filled domain '" + target.name + "' with 60 phrases!");
		}

		System.out.println("ALL A1 DOMAINS ENRICHED SUCCESSFULLY!");
	}

	@Test
	void enrichDbA2() {
		// Find Level A2
		Level a2Level = levelRepository.findAll().stream()
				.filter(l -> l.getName().equalsIgnoreCase("A2"))
				.findFirst()
				.orElseThrow(() -> new RuntimeException("Level A2 not found"));

		System.out.println("Found Level A2 (ID: " + a2Level.getId() + ")");

		// Define the 10 domains to enrich/add for A2
		List<DomainInfo> targetDomains = List.of(
				new DomainInfo("Famille et relations", "Users"),
				new DomainInfo("Travail et professions", "Briefcase"),
				new DomainInfo("Voyages et vacances", "Plane"),
				new DomainInfo("Études et apprentissage", "GraduationCap"),
				new DomainInfo("Médias et actualités", "Newspaper"),
				new DomainInfo("Environnement et nature", "Trees"),
				new DomainInfo("Sentiments et émotions", "Smile"),
				new DomainInfo("Projets et avenir", "Calendar"),
				new DomainInfo("Arts et culture", "Music"),
				new DomainInfo("Services et administration", "Building")
		);

		enrichLevel("A2", targetDomains, "Make sure phrases are suitable for a pre-intermediate learner at CEFR A2 level. They should contain simple descriptions, past/future/present contexts (e.g. passé composé, imparfait, futur proche) and common conversational expressions. Use clear, formal Arabic translations. Keep the style natural.", 30);
	}

	private void enrichLevel(String levelName, List<DomainInfo> targetDomains, String promptInstruction, int batchSize) {
		// Find Level
		Level level = levelRepository.findAll().stream()
				.filter(l -> l.getName().equalsIgnoreCase(levelName))
				.findFirst()
				.orElseThrow(() -> new RuntimeException("Level " + levelName + " not found"));

		System.out.println("Found Level " + levelName + " (ID: " + level.getId() + ")");

		for (DomainInfo target : targetDomains) {
			// Find or create domain
			Domain domain = domainRepository.findByLevelId(level.getId()).stream()
					.filter(d -> d.getName().equalsIgnoreCase(target.name))
					.findFirst()
					.orElse(null);

			if (domain == null) {
				System.out.println("Creating new domain: " + target.name);
				domain = Domain.builder()
						.name(target.name)
						.icon(target.icon)
						.level(level)
						.build();
				domain = domainRepository.save(domain);
			} else {
				System.out.println("Domain already exists: " + target.name + " (ID: " + domain.getId() + ")");
			}

			// Check current phrase count
			long existingCount = phraseRepository.countByDomainId(domain.getId());
			System.out.println("Domain '" + target.name + "' has " + existingCount + " phrases. Target is 60.");

			if (existingCount >= 60) {
				System.out.println("Skipping domain: " + target.name + " (Already has 60 or more phrases)");
				continue;
			}

			int currentCount = (int) existingCount;
			int targetCount = 60;

			while (currentCount < targetCount) {
				int phrasesNeeded = Math.min(batchSize, targetCount - currentCount);
				System.out.println("Generating batch of " + phrasesNeeded + " phrases for domain '" + target.name + "'...");

				// Fetch existing phrases to prevent duplicates
				List<String> existingPhrases = phraseRepository.findByDomainIdOrderByOrderIndexAsc(domain.getId()).stream()
						.map(Phrase::getFrenchText)
						.collect(Collectors.toList());

				String prompt = aiService.getPhraseGenerationPrompt(
						domain.getName(),
						levelName,
						phrasesNeeded,
						existingPhrases,
						promptInstruction
				);

				String response = aiService.generateContent(prompt);
				List<PhraseDto> phraseDtos = parsePhrases(response);

				if (phraseDtos.isEmpty()) {
					System.err.println("Failed to generate/parse phrases for domain '" + target.name + "', retrying batch...");
					try {
						Thread.sleep(10000);
					} catch (InterruptedException ie) {
						Thread.currentThread().interrupt();
					}
					continue;
				}

				int savedInBatch = 0;
				for (PhraseDto dto : phraseDtos) {
					if (dto.frenchText == null || dto.frenchText.trim().isEmpty()) {
						continue;
					}

					// Verify double-check no duplication
					String cleanFrench = dto.frenchText.trim();
					boolean exists = phraseRepository.findByDomainIdOrderByOrderIndexAsc(domain.getId()).stream()
							.anyMatch(p -> p.getFrenchText().equalsIgnoreCase(cleanFrench));

					if (exists) {
						System.out.println("  Skipping duplicate phrase: " + cleanFrench);
						continue;
					}

					// Save Phrase
					Phrase phrase = Phrase.builder()
							.frenchText(cleanFrench)
							.arabicTranslation(dto.arabicTranslation != null ? dto.arabicTranslation.trim() : "")
							.domain(domain)
							.orderIndex(currentCount)
							.build();

					Phrase savedPhrase = phraseRepository.save(phrase);
					currentCount++;
					savedInBatch++;

					// Save Vocabulary
					if (dto.vocabularyList != null) {
						for (VocabularyDto vDto : dto.vocabularyList) {
							if (vDto.frenchWord == null || vDto.frenchWord.trim().isEmpty()) {
								continue;
							}
							Vocabulary vocab = Vocabulary.builder()
									.frenchWord(vDto.frenchWord.trim())
									.arabicMeaning(vDto.arabicMeaning != null ? vDto.arabicMeaning.trim() : "")
									.phrase(savedPhrase)
									.build();
							vocabularyRepository.save(vocab);
						}
					}
				}

				System.out.println("Saved " + savedInBatch + " phrases in this batch. Current count in domain: " + currentCount);

				// Brief delay between batches to respect API rate limits (8 seconds)
				try {
					Thread.sleep(8000);
				} catch (InterruptedException ie) {
					Thread.currentThread().interrupt();
				}
			}

			System.out.println("Successfully filled domain '" + target.name + "' with 60 phrases!");
		}

		System.out.println("ALL " + levelName + " DOMAINS ENRICHED SUCCESSFULLY!");
	}

	@Disabled("Manual enrichment test. Run only when updating content.")
    @Test
    void enrichDbB1() {
        List<DomainInfo> targetDomains = List.of(
                new DomainInfo("Voyages et déplacements", "Plane"),
                new DomainInfo("Santé et bien-être", "Heart"),
                new DomainInfo("Environnement et écologie", "Trees"),
                new DomainInfo("Culture et loisirs", "Music"),
                new DomainInfo("Travail et carrière", "Briefcase"),
                new DomainInfo("Éducation et formation", "GraduationCap"),
                new DomainInfo("Médias et technologies", "Newspaper"),
                new DomainInfo("Société et actualités", "Users"),
                new DomainInfo("Gastronomie et cuisine", "Utensils"),
                new DomainInfo("Relations et communication", "MessageCircle")
        );

        enrichLevel("B1", targetDomains,
                "Make sure phrases are suitable for an intermediate learner at CEFR B1 level. They should cover practical topics, opinions, and more complex sentence structures with everyday vocabulary. Use clear, formal Arabic translations. Keep the style natural.",
                30);
	}

	@Disabled("Manual enrichment test. Run only when updating content.")
    @Test
    void enrichDbB2() {
        List<DomainInfo> targetDomains = List.of(
                new DomainInfo("Débats de société", "MessageSquare"),
                new DomainInfo("Science et innovation", "Cpu"),
                new DomainInfo("Art et expressions artistiques", "Palette"),
                new DomainInfo("Économie et consommation", "TrendingUp"),
                new DomainInfo("Histoire et patrimoine", "Landmark"),
                new DomainInfo("Politique et citoyenneté", "Globe"),
                new DomainInfo("Psychologie et relations humaines", "Users"),
                new DomainInfo("Médias et esprit critique", "Newspaper"),
                new DomainInfo("Défis environnementaux", "Leaf"),
                new DomainInfo("Mondialisation et cultures", "Compass")
        );

        enrichLevel("B2", targetDomains,
                "Make sure phrases are suitable for an upper-intermediate learner at CEFR B2 level. They should express opinions, arguments, nuance, complex sentence structures (e.g. subjonctif, conditionnel, double pronouns, gérondif) and advanced vocabulary. Use clear, formal Arabic translations. Keep the style natural.",
                30);
    }

	@Disabled("Manual enrichment test. Run only when updating content.")
    @Test
    void enrichDbC1() {
        List<DomainInfo> targetDomains = List.of(
                new DomainInfo("Philosophie et éthique", "Brain"),
                new DomainInfo("Économie et mondialisation", "TrendingUp"),
                new DomainInfo("Arts et critique littéraire", "BookOpen"),
                new DomainInfo("Sciences et technologies avancées", "Cpu"),
                new DomainInfo("Géopolitique et relations internationales", "Globe"),
                new DomainInfo("Sociologie et mutations sociales", "Users"),
                new DomainInfo("Droit et institutions", "Scale"),
                new DomainInfo("Écologie et transition énergétique", "Leaf"),
                new DomainInfo("Médias et rhétorique", "Volume2"),
                new DomainInfo("Histoire et philosophie des sciences", "Compass")
        );

        enrichLevel("C1", targetDomains,
                "Make sure phrases are suitable for an advanced learner at CEFR C1 level. They should contain complex, structured expressions, intellectual concepts, figures of speech, advanced logical connectors (e.g. subjonctif imparfait, double negation, complex relatives) and formal, idiomatic vocabulary. Use clear, formal Arabic translations. Keep the style natural.",
                30);
    }

	@Disabled("Manual enrichment test. Run only when updating content.")
    @Test
    void enrichDbC2() {
        List<DomainInfo> targetDomains = List.of(
                new DomainInfo("Épistémologie et théorie de la connaissance", "Brain"),
                new DomainInfo("Critique littéraire et herméneutique", "BookOpen"),
                new DomainInfo("Éthique appliquée et bioéthique", "Shield"),
                new DomainInfo("Géopolitique et macroéconomie", "Globe"),
                new DomainInfo("Esthétique et philosophie de l'art", "Palette"),
                new DomainInfo("Sociologie critique et anthropologie", "Users"),
                new DomainInfo("Droit constitutionnel et philosophie du droit", "Scale"),
                new DomainInfo("Écologie politique et effondrement", "Leaf"),
                new DomainInfo("Rhétorique, dialectique et persuasion", "Volume2"),
                new DomainInfo("Histoire des mentalités et des idées", "Compass")
        );

        enrichLevel("C2", targetDomains,
                "Make sure phrases are suitable for a highly advanced learner at CEFR C2 level. They should exhibit near-native mastery, including highly literary language, elegant style, rare vocabulary (vocabulaire soutenu/littéraire), complex grammatical constructions (subjonctif imparfait, conditionnel passé deuxième forme, inversions de sujet complexes, participes présents/gérondifs complexes) and abstract, academic concepts. Use formal, highly accurate and elegant Arabic translations. Keep the style natural and precise.",
                30);
    }


	@Test
	void enrichQuizzesA1() {
		// Find Level A1
		Level a1Level = levelRepository.findAll().stream()
				.filter(l -> l.getName().equalsIgnoreCase("A1"))
				.findFirst()
				.orElseThrow(() -> new RuntimeException("Level A1 not found"));

		System.out.println("Found Level A1 (ID: " + a1Level.getId() + ")");

		// Define the 10 domains to enrich/add
		List<DomainInfo> targetDomains = List.of(
				new DomainInfo("Salutations et présentations", "User"),
				new DomainInfo("Alimentation et boissons", "Utensils"),
				new DomainInfo("Maison et logement", "Home"),
				new DomainInfo("Loisirs et sports", "Activity"),
				new DomainInfo("Routine et temps", "Clock"),
				new DomainInfo("Achats et argent", "ShoppingBag"),
				new DomainInfo("Météo et saisons", "CloudSun"),
				new DomainInfo("Corps et santé", "Heart"),
				new DomainInfo("Ville et transports", "MapPin"),
				new DomainInfo("Vêtements et apparence", "Shirt")
		);

		for (DomainInfo target : targetDomains) {
			// Find domain
			Domain domain = domainRepository.findByLevelId(a1Level.getId()).stream()
					.filter(d -> d.getName().equalsIgnoreCase(target.name))
					.findFirst()
					.orElse(null);

			if (domain == null) {
				System.err.println("Domain not found: " + target.name);
				continue;
			}

			// Check if quiz already exists
			java.util.Optional<Quiz> existingQuiz = quizRepository.findByDomainId(domain.getId());
			if (existingQuiz.isPresent()) {
				System.out.println("Quiz already exists for domain '" + target.name + "' (ID: " + existingQuiz.get().getId() + "). Skipping.");
				continue;
			}

			System.out.println("Generating quiz for domain: " + target.name);

			// We need 6 questions: 3 MCQ, 3 FILL_BLANK
			String prompt = "Generate a French practice quiz for the domain '" + target.name + "' at CEFR A1 level.\n" +
					"The quiz must contain exactly 6 questions:\n" +
					"- 3 Multiple Choice Questions (MCQ)\n" +
					"- 3 Fill-in-the-blank Questions (FILL_BLANK). Use '___' (three underscores) for the blank in the frenchText.\n\n" +
					"All vocabulary and grammar must be extremely simple, suited for absolute beginners (Level A1).\n" +
					"Provide exactly 4 options for each question.\n" +
					"Provide the exact correct option in 'correctAnswer'.\n\n" +
					"Return ONLY a raw JSON array matching this format (no markdown code blocks, no backticks):\n" +
					"[\n" +
					"  {\n" +
					"    \"frenchText\": \"Comment dit-on 'Thank you' en français ?\",\n" +
					"    \"type\": \"MCQ\",\n" +
					"    \"options\": [\"S'il vous plaît\", \"Merci\", \"Bonjour\", \"Au revoir\"],\n" +
					"    \"correctAnswer\": \"Merci\"\n" +
					"  },\n" +
					"  {\n" +
					"    \"frenchText\": \"Je ___ un café, s'il vous plaît.\",\n" +
					"    \"type\": \"FILL_BLANK\",\n" +
					"    \"options\": [\"suis\", \"voudrais\", \"ai\", \"mange\"],\n" +
					"    \"correctAnswer\": \"voudrais\"\n" +
					"  }\n" +
					"]";

			int retries = 3;
			boolean success = false;
			while (retries > 0 && !success) {
				try {
					String response = aiService.generateContent(prompt);
					List<QuestionDto> questionDtos = parseQuestions(response);

					if (questionDtos.size() == 6) {
						Quiz quiz = Quiz.builder()
								.title("Quiz: " + domain.getName())
								.domain(domain)
								.level(a1Level)
								.build();

						List<Question> questions = new ArrayList<>();
						for (QuestionDto dto : questionDtos) {
							Question.QuestionType qType;
							try {
								qType = Question.QuestionType.valueOf(dto.type.toUpperCase());
							} catch (Exception e) {
								qType = Question.QuestionType.MCQ;
							}
							
							Question question = Question.builder()
									.frenchText(dto.frenchText)
									.type(qType)
									.options(dto.options)
									.correctAnswer(dto.correctAnswer)
									.quiz(quiz)
									.build();
							questions.add(question);
						}

						quiz.setQuestions(questions);
						quizRepository.save(quiz);
						System.out.println("Successfully saved quiz for domain '" + target.name + "' with 6 questions.");
						success = true;
					} else {
						System.err.println("Gemini generated " + questionDtos.size() + " questions instead of 6. Retrying...");
						retries--;
						Thread.sleep(10000);
					}
				} catch (Exception e) {
					System.err.println("Error generating quiz: " + e.getMessage());
					retries--;
					try {
						Thread.sleep(10000);
					} catch (InterruptedException ie) {
						Thread.currentThread().interrupt();
					}
				}
			}

			// Delay between domains to respect API rate limits
			try {
				Thread.sleep(8000);
			} catch (InterruptedException ie) {
				Thread.currentThread().interrupt();
			}
		}

		System.out.println("ALL A1 QUIZZES CREATED SUCCESSFULLY!");
	}


}