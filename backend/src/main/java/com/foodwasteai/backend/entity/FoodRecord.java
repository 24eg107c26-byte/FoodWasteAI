package com.foodwasteai.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "food_records")
public class FoodRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long donorId;

    @Column(nullable = false)
    private String foodType;

    @Column(nullable = false)
    private Double quantityPrepared;

    @Column(nullable = false)
    private Double quantityConsumed;

    @Column(nullable = false)
    private Integer numberOfCustomers;

    @Column(nullable = false)
    private String mealType;

    @Column(nullable = false)
    private String dayOfWeek;

    @Column(nullable = false)
    private LocalDate recordDate;

    public FoodRecord() {
    }

    public FoodRecord(Long donorId, String foodType, Double quantityPrepared,
                      Double quantityConsumed, Integer numberOfCustomers,
                      String mealType, String dayOfWeek, LocalDate recordDate) {
        this.donorId = donorId;
        this.foodType = foodType;
        this.quantityPrepared = quantityPrepared;
        this.quantityConsumed = quantityConsumed;
        this.numberOfCustomers = numberOfCustomers;
        this.mealType = mealType;
        this.dayOfWeek = dayOfWeek;
        this.recordDate = recordDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public String getFoodType() {
        return foodType;
    }

    public void setFoodType(String foodType) {
        this.foodType = foodType;
    }

    public Double getQuantityPrepared() {
        return quantityPrepared;
    }

    public void setQuantityPrepared(Double quantityPrepared) {
        this.quantityPrepared = quantityPrepared;
    }

    public Double getQuantityConsumed() {
        return quantityConsumed;
    }

    public void setQuantityConsumed(Double quantityConsumed) {
        this.quantityConsumed = quantityConsumed;
    }

    public Integer getNumberOfCustomers() {
        return numberOfCustomers;
    }

    public void setNumberOfCustomers(Integer numberOfCustomers) {
        this.numberOfCustomers = numberOfCustomers;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }
}