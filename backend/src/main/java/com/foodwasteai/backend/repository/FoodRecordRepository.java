package com.foodwasteai.backend.repository;

import com.foodwasteai.backend.entity.FoodRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodRecordRepository extends JpaRepository<FoodRecord, Long> {

    List<FoodRecord> findByDonorId(Long donorId);
}