package com.foodwasteai.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long foodRecordId;

    @Column(nullable = false)
    private Double predictedConsumption;

    @Column(nullable = false)
    private Double predictedSurplus;

    @Column(nullable = false)
    private LocalDateTime predictionDate;

    public Prediction() {
    }

    public Prediction(Long foodRecordId, Double predictedConsumption,
                      Double predictedSurplus, LocalDateTime predictionDate) {
        this.foodRecordId = foodRecordId;
        this.predictedConsumption = predictedConsumption;
        this.predictedSurplus = predictedSurplus;
        this.predictionDate = predictionDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getFoodRecordId() {
        return foodRecordId;
    }

    public void setFoodRecordId(Long foodRecordId) {
        this.foodRecordId = foodRecordId;
    }

    public Double getPredictedConsumption() {
        return predictedConsumption;
    }

    public void setPredictedConsumption(Double predictedConsumption) {
        this.predictedConsumption = predictedConsumption;
    }

    public Double getPredictedSurplus() {
        return predictedSurplus;
    }

    public void setPredictedSurplus(Double predictedSurplus) {
        this.predictedSurplus = predictedSurplus;
    }

    public LocalDateTime getPredictionDate() {
        return predictionDate;
    }

    public void setPredictionDate(LocalDateTime predictionDate) {
        this.predictionDate = predictionDate;
    }
}