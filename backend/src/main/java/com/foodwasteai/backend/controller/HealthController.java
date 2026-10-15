package com.foodwasteai.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final String aiServiceUrl;
    private final RestTemplate shortTimeoutClient;

    public HealthController(@Value("${app.ai-service.url}") String aiServiceUrl) {
        this.aiServiceUrl = aiServiceUrl.trim().replaceAll("/+$", "");

        // Short timeouts: the request still wakes a sleeping AI service,
        // and we report "WAKING" instead of waiting for it.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(5000);
        this.shortTimeoutClient = new RestTemplate(factory);
    }

    @GetMapping("/health")
    public Map<String, String> health(@RequestParam(defaultValue = "false") boolean deep) {
        Map<String, String> result = new LinkedHashMap<>();
        result.put("status", "UP");
        result.put("service", "FoodWasteAI Backend");

        if (deep) {
            result.put("ai", isAiUp() ? "UP" : "WAKING");
        }
        return result;
    }

    private boolean isAiUp() {
        try {
            shortTimeoutClient.getForObject(aiServiceUrl + "/health", String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}