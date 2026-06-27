package com.eformation.api.controller;

import com.eformation.api.dto.ChatRequest;
import com.eformation.api.service.AiService;
import com.eformation.api.model.User;
import com.eformation.api.model.Role;
import com.eformation.api.model.SystemSetting;
import com.eformation.api.repository.SystemSettingRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/student/chat")
public class ChatController {

    @Autowired
    private AiService aiService;

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    private boolean hasEmmaAccess(User user) {
        if (user.getRole() == Role.ADMIN) {
            return true;
        }
        java.util.Optional<SystemSetting> globalAccess = systemSettingRepository.findById("emma_global_access");
        if (globalAccess.isPresent() && "false".equalsIgnoreCase(globalAccess.get().getValue())) {
            return false;
        }
        if (!user.isEmmaAccess()) {
            return false;
        }
        if (user.getGroupName() != null && !user.getGroupName().trim().isEmpty()) {
            java.util.Optional<SystemSetting> groupAccess = systemSettingRepository.findById("emma_group_disabled_" + user.getGroupName().trim());
            if (groupAccess.isPresent() && "true".equalsIgnoreCase(groupAccess.get().getValue())) {
                return false;
            }
        }
        return true;
    }

    @PostMapping
    public ResponseEntity<String> chatWithEmma(@RequestBody ChatRequest chatRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        if (!hasEmmaAccess(user)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body("{\"error\": \"L'accès à Emma AI a été désactivé par l'administrateur.\"}");
        }
        // Build conversation history representation for the prompt
        String historyText = "";
        if (chatRequest.getHistory() != null && !chatRequest.getHistory().isEmpty()) {
            historyText = chatRequest.getHistory().stream()
                    .map(msg -> msg.getRole().toUpperCase() + ": " + msg.getContent())
                    .collect(Collectors.joining("\n"));
        } else {
            historyText = "Aucun historique.";
        }

        // Create the customized system prompt
        String prompt = "Tu es Emma, une professeure de français conversationnelle (FLE) chaleureuse, naturelle, motivante et encourageante.\n" +
                "Ton objectif est de discuter avec l'utilisateur pour l'aider à pratiquer son français, en t'adaptant strictement au niveau CECRL et au domaine (contexte) choisi par l'utilisateur.\n\n" +
                "Paramètres de la conversation :\n" +
                "- Domaine (contexte de conversation) : " + chatRequest.getDomain() + " (tu dois simuler des situations réalistes et adopter le rôle approprié, e.g., recruteur, ami, collègue, commerçant, etc.)\n" +
                "- Niveau CECRL de l'utilisateur : " + chatRequest.getLevel() + " (tu dois adapter la complexité de tes phrases, ton vocabulaire, et tes questions à ce niveau :\n" +
                "  * A1 : phrases très simples, vocabulaire de base, questions fermées.\n" +
                "  * A2 : phrases courtes, réponses guidées.\n" +
                "  * B1 : conversations simples et naturelles, questions ouvertes.\n" +
                "  * B2 : échanges fluides, explications simples.\n" +
                "  * C1 : discours structuré, nuance linguistique.\n" +
                "  * C2 : niveau natif, débat, abstraction possible).\n\n" +
                "Règles d'or :\n" +
                "1. Parle UNIQUEMENT en français.\n" +
                "2. Reste naturelle, bienveillante et positive. Encourage l'utilisateur.\n" +
                "3. Analyse le dernier message de l'utilisateur pour formuler un feedback pédagogique doux dans l'objet de retour. Ne fais JAMAIS de cours de grammaire technique ou théorique scolaire. Fais des corrections douces et naturelles en reformulant poliment.\n" +
                "4. Tes réponses doivent être TRÈS COURTES, SIMPLES et DIRECTES. Ne pose jamais plus d'UNE SEULE question à la fois, exactement comme dans une conversation orale naturelle.\n\n" +
                "Historique des échanges :\n" +
                historyText + "\n\n" +
                "Dernier message de l'utilisateur : \"" + chatRequest.getMessage() + "\"\n\n" +
                "Génère une réponse au format JSON STRICT comme suit :\n" +
                "{\n" +
                "  \"reply\": \"Ta réponse conversationnelle en français sous le rôle d'Emma, adaptée au niveau et au domaine\",\n" +
                "  \"feedback\": {\n" +
                "    \"userMessage\": \"" + chatRequest.getMessage().replace("\"", "\\\"") + "\",\n" +
                "    \"comprehension\": \"Une phrase d'encouragement montrant que tu as compris son message\",\n" +
                "    \"reformulation\": \"Une reformulation douce et naturelle si l'utilisateur a commis des erreurs de français, ou un compliment chaleureux s'il n'y a pas d'erreur\",\n" +
                "    \"suggestion\": \"Une suggestion simple et utile d'expression ou de mot alternatif à utiliser, ou une astuce de conversation\"\n" +
                "  }\n" +
                "}\n\n" +
                "IMPORTANT : Retourne uniquement le JSON valide, sans blocs de code markdown (comme ```json), sans texte supplémentaire en dehors du JSON.";

        try {
            String aiResponse = aiService.generateContent(prompt);
            
            // Just in case the service returned markdown code blocks, strip them out
            if (aiResponse.startsWith("```json")) {
                aiResponse = aiResponse.substring(7);
            }
            if (aiResponse.endsWith("```")) {
                aiResponse = aiResponse.substring(0, aiResponse.length() - 3);
            }
            aiResponse = aiResponse.trim();
            
            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                    .body(aiResponse);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Erreur de traitement du chat: " + e.getMessage() + "\"}");
        }
    }

    @PostMapping("/transcribe")
    public ResponseEntity<Map<String, String>> transcribeAudio(@RequestBody Map<String, String> payload) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        if (!hasEmmaAccess(user)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "L'accès à Emma AI a été désactivé par l'administrateur."));
        }
        String base64Audio = payload.get("audioData");
        String mimeType = payload.get("mimeType");
        if (base64Audio == null || mimeType == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "audioData or mimeType is missing."));
        }
        
        try {
            String transcription = aiService.transcribeAudio(base64Audio, mimeType);
            return ResponseEntity.ok(Map.of("text", transcription));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to transcribe: " + e.getMessage()));
        }
    }
}
