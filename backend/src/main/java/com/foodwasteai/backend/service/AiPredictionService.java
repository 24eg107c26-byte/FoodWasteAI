
package com.foodwasteai.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.Map;

@Service
public class AiPredictionService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<?, ?> predict(Map<String, Object> foodData) {
        String url = "http://localhost:8000/predict";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(foodData, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(
                url, request, Map.class
        );

        return response.getBody();
    }
}
