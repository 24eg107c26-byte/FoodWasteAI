package com.foodwasteai.backend.repository;

import com.foodwasteai.backend.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    List<Prediction> findByFoodRecordId(Long foodRecordId);

    @Query("SELECT COALESCE(SUM(p.predictedSurplus), 0.0) FROM Prediction p")
    Double sumPredictedSurplus();

    // A prediction only stores foodRecordId, so we join with FoodRecord to get
    // the food type. Each row is: [foodType, total surplus, number of predictions].
    @Query("SELECT f.foodType, SUM(p.predictedSurplus), COUNT(p) " +
           "FROM Prediction p, FoodRecord f " +
           "WHERE p.foodRecordId = f.id " +
           "GROUP BY f.foodType " +
           "ORDER BY SUM(p.predictedSurplus) DESC")
    List<Object[]> surplusByFoodType();
}