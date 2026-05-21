package com.eformation.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.List;

@Service
public class AiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;

    @Value("${gemini.api.version:v1beta}")
    private String apiVersion;

    private final String API_HOST = "https://generativelanguage.googleapis.com/";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();



    public String generateContent(String prompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "Error: Gemini API Key not configured.";
        }

        // List of models to try in order of preference
        List<String> modelsToTry = new java.util.ArrayList<>();
        modelsToTry.add(modelName);
        if (!modelName.equals("gemini-1.5-flash")) {
            modelsToTry.add("gemini-1.5-flash");
        }
        if (!modelName.equals("gemini-2.5-flash") && !"gemini-2.5-flash".equals(modelName)) {
            modelsToTry.add("gemini-2.5-flash");
        }

        Exception lastException = null;

        for (String currentModel : modelsToTry) {
            int retries = 3;
            long waitTime = 1000; // start with 1 second backoff

            for (int attempt = 1; attempt <= retries; attempt++) {
                try {
                    return callGeminiApi(prompt, currentModel);
                } catch (Exception e) {
                    lastException = e;
                    System.err.println("Gemini API call failed for model " + currentModel + " (Attempt " + attempt + " of " + retries + "): " + e.getMessage());
                    
                    boolean isRetryable = true;
                    if (e instanceof org.springframework.web.client.HttpStatusCodeException se) {
                        org.springframework.http.HttpStatusCode statusCode = se.getStatusCode();
                        System.err.println("HTTP Status Code: " + statusCode.value() + ", Response Body: " + se.getResponseBodyAsString());
                        // 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found are generally NOT retryable.
                        // 429 Too Many Requests and 503 Service Unavailable are retryable.
                        if (statusCode.is4xxClientError() && statusCode.value() != 429) {
                            isRetryable = false;
                        }
                    }

                    if (!isRetryable || attempt == retries) {
                        break; // Don't retry
                    }

                    try {
                        System.out.println("Waiting " + waitTime + "ms before retry...");
                        Thread.sleep(waitTime);
                        waitTime *= 2; // exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
            
            System.err.println("Model " + currentModel + " failed. Trying next model if available...");
        }

        // If we reach here, all attempts on all models failed
        String errorMsg = "Error calling Gemini API after trying fallback models: ";
        if (lastException != null) {
            errorMsg += lastException.getMessage();
            if (lastException instanceof org.springframework.web.client.HttpStatusCodeException se) {
                errorMsg += " - Response: " + se.getResponseBodyAsString();
            }
        } else {
            errorMsg += "Unknown error.";
        }
        return errorMsg;
    }

    private String callGeminiApi(String prompt, String model) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
            "contents", new Object[]{
                Map.of("parts", new Object[]{
                    Map.of("text", prompt)
                })
            }
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = API_HOST + apiVersion + "/models/" + model + ":generateContent?key=" + apiKey;
        System.out.println("Calling Gemini API (" + model + "): " + url.replace(apiKey, "HIDDEN_KEY"));
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        
        // Clean markdown formatting if present
        if (text.contains("```json")) {
            text = text.substring(text.indexOf("```json") + 7);
            if (text.contains("```")) {
                text = text.substring(0, text.indexOf("```"));
            }
        } else if (text.contains("```")) {
            text = text.substring(text.indexOf("```") + 3);
            if (text.contains("```")) {
                text = text.substring(0, text.indexOf("```"));
            }
        }
        
        return text.trim();
    }

    public String getDomainGenerationPrompt(String level, int count, List<String> existingDomains, String guide) {
        String existingList = existingDomains.isEmpty() ? "None" : String.join(", ", existingDomains);
        String guidePart = (guide == null || guide.isEmpty()) ? "" : "\nCustom Guidance: " + guide;
        
        return "Generate " + count + " new learning domains (themes) for French learners at CEFR level " + level + ". " +
               "\nCRITICAL: The domain name must be in FRENCH (e.g. 'La Famille', 'Au Travail'). Do not use English." +
               "\nContext: These domains should be suitable for the specified level. " +
               "\nExisting domains (DO NOT DUPLICATE): " + existingList + 
               guidePart + 
               "\n\nFormat the output as a clean JSON array of objects: " +
               "[{\"name\": \"FRENCH_DOMAIN_NAME\"}] " +
               "\nIMPORTANT: Return ONLY the JSON array, no markdown, no explanation.";
    }

    public String getPhraseGenerationPrompt(String domain, String level, int count, List<String> existingPhrases, String guide) {
        String existingList = existingPhrases.isEmpty() ? "None" : String.join(", ", existingPhrases);
        String guidePart = (guide == null || guide.isEmpty()) ? "" : "\nCustom Guidance: " + guide;

        return "Generate " + count + " practical French phrases for a learner at level " + level + " in the domain of '" + domain + "'. " +
               "\nCRITICAL: All phrases and vocabulary must be in FRENCH. Use formal ARABIC only for translations and meanings." +
               "\nExisting phrases (DO NOT DUPLICATE): " + existingList +
               guidePart +
               "\nFormat the output as a clean JSON array of objects: " +
               "[{" +
               "  \"frenchText\": \"...\", " +
               "  \"arabicTranslation\": \"...\", " +
               "  \"vocabularyList\": [{\"frenchWord\": \"...\", \"arabicMeaning\": \"...\"}]" +
               "}] " +
               "\nIMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanation.";
    }

    public String getQuizGenerationPrompt(String domain, String level) {
        return "Generate a 5-question French quiz for level " + level + " in the domain of '" + domain + "'. " +
               "\nCRITICAL: Everything in the quiz (questions, options, correct answers) must be entirely in FRENCH. No Arabic or English allowed." +
               "\nTypes can be MCQ or Fill-in-the-blank. " +
               "\nFormat as JSON: [{\"frenchText\": \"...\", \"type\": \"MCQ\", \"options\": [\"...\", \"...\"], \"correctAnswer\": \"...\"}] " +
               "\nIMPORTANT: Return ONLY the JSON array, no markdown formatting.";
    }

    public String getLevelQuizGenerationPrompt(String levelName, List<String> phrases) {
        String phrasesContext = phrases.isEmpty() ? "No specific phrases provided, generate standard phrases for this level." 
                                                   : "Phrases related to this level (use these as context/vocabulary to generate questions/options/fill-in-the-blanks):\n- " + String.join("\n- ", phrases);
        
        return "Generate a 5-question French quiz for level " + levelName + ". " +
               "\nCRITICAL: Everything in the quiz (questions, options, correct answers) must be entirely in FRENCH. No Arabic or English allowed." +
               "\n" + phrasesContext +
               "\nQuestions must be based on or test the vocabulary and syntax from the phrases listed above. " +
               "\nEach question can be styled as MCQ or fill-in-the-blank, but MUST always have a list of options and exactly one correct answer matching one of the options." +
               "\nFormat as a clean JSON array of objects: " +
               "[{\"frenchText\": \"...\", \"type\": \"MCQ\", \"options\": [\"Option 1\", \"Option 2\", \"Option 3\", \"Option 4\"], \"correctAnswer\": \"Option 1\"}] " +
               "\nIMPORTANT: Return ONLY the JSON array, no markdown formatting, no explanation.";
    }
}
