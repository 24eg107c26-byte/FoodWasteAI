package com.foodwasteai.backend.controller;

import com.foodwasteai.backend.entity.FoodRecord;
import com.foodwasteai.backend.repository.FoodRecordRepository;
import com.foodwasteai.backend.security.AuthUtil;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/food-records")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class FoodRecordController {

    private final FoodRecordRepository foodRecordRepository;

    public FoodRecordController(FoodRecordRepository foodRecordRepository) {
        this.foodRecordRepository = foodRecordRepository;
    }

    // The record always belongs to the logged-in user.
    @PostMapping
    public FoodRecord createFoodRecord(@RequestBody FoodRecord foodRecord,
                                       Authentication authentication) {
        foodRecord.setDonorId(AuthUtil.userId(authentication));
        return foodRecordRepository.save(foodRecord);
    }

    // Admin only (enforced in SecurityConfig)
    @GetMapping
    public List<FoodRecord> getAllFoodRecords() {
        return foodRecordRepository.findAll();
    }

    // Own records only, unless ADMIN
    @GetMapping("/donor/{donorId}")
    public List<FoodRecord> getFoodRecordsByDonor(@PathVariable Long donorId,
                                                  Authentication authentication) {
        if (!AuthUtil.isAdmin(authentication)
                && !donorId.equals(AuthUtil.userId(authentication))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only view your own food records");
        }
        return foodRecordRepository.findByDonorId(donorId);
    }
}