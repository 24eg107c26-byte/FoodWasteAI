package com.foodwasteai.backend.controller;

import com.foodwasteai.backend.repository.DonationRepository;
import com.foodwasteai.backend.repository.PredictionRepository;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class DashboardController {

    private final DonationRepository donationRepository;
    private final PredictionRepository predictionRepository;

    public DashboardController(DonationRepository donationRepository,
                               PredictionRepository predictionRepository) {
        this.donationRepository = donationRepository;
        this.predictionRepository = predictionRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Double surplusSum = predictionRepository.sumPredictedSurplus();
        double totalSurplus = surplusSum == null ? 0.0 : surplusSum;

        long claimed = donationRepository.countByStatus("CLAIMED");
        long completed = donationRepository.countByStatus("COMPLETED");

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDonations", donationRepository.count());
        stats.put("availableDonations", donationRepository.countByStatus("AVAILABLE"));
        // A completed donation was also claimed, so it is included here.
        stats.put("claimedDonations", claimed + completed);
        stats.put("completedDonations", completed);
        stats.put("totalPredictions", predictionRepository.count());
        stats.put("totalPredictedSurplus", Math.round(totalSurplus * 100.0) / 100.0);
        return stats;
    }
}