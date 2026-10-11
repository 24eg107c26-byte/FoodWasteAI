
package com.foodwasteai.backend.controller;

import com.foodwasteai.backend.entity.Prediction;
import com.foodwasteai.backend.repository.PredictionRepository;
import com.foodwasteai.backend.service.AiPredictionService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/predictions")
@CrossOrigin(origins = "http://localhost:5173")
public class PredictionController {

    private final AiPredictionService aiPredictionService;
    private final PredictionRepository predictionRepository;

    public PredictionController(
            AiPredictionService aiPredictionService,
            PredictionRepository predictionRepository) {
        this.aiPredictionService = aiPredictionService;
        this.predictionRepository = predictionRepository;
    }

    @PostMapping("/predict")
    public ResponseEntity<?> predict(
            @RequestBody Map<String, Object> foodData) {
        try {
            // Call the trained AI model through FastAPI
            Map<?, ?> aiResult = aiPredictionService.predict(foodData);

            double predictedConsumption =
                    ((Number) aiResult.get("predicted_consumption"))
                            .doubleValue();

            double predictedSurplus =
                    ((Number) aiResult.get("predicted_surplus"))
                            .doubleValue();

            // Save the prediction in MySQL
            Object recordIdValue = foodData.get("foodRecordId");

            if (recordIdValue == null) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "error",
                                "foodRecordId is required to save a prediction"
                        )
                );
            }

            Long foodRecordId =
                    ((Number) recordIdValue).longValue();

            Prediction prediction = new Prediction(
                    foodRecordId,
                    predictedConsumption,
                    predictedSurplus,
                    LocalDateTime.now()
            );

            Prediction savedPrediction =
                    predictionRepository.save(prediction);

            // Return the AI result and saved database ID
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedPrediction.getId());
            response.put("foodRecordId", savedPrediction.getFoodRecordId());
            response.put("food_type", aiResult.get("food_type"));
            response.put("quantity_prepared",
                    aiResult.get("quantity_prepared"));
            response.put("predicted_consumption",
                    savedPrediction.getPredictedConsumption());
            response.put("predicted_surplus",
                    savedPrediction.getPredictedSurplus());
            response.put("unit", aiResult.get("unit"));
            response.put("predictionDate",
                    savedPrediction.getPredictionDate());
            response.put("savedToDatabase", true);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "error", "Prediction failed",
                            "message", e.getMessage() == null
                                    ? "Unknown error"
                                    : e.getMessage()
                    )
            );
        }
    }
}
