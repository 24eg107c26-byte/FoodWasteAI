package com.foodwasteai.backend.controller;

import com.foodwasteai.backend.entity.Donation;
import com.foodwasteai.backend.entity.Prediction;
import com.foodwasteai.backend.repository.DonationRepository;
import com.foodwasteai.backend.repository.PredictionRepository;
import com.foodwasteai.backend.repository.UserRepository;

import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

// Every endpoint here is ADMIN-only (rule in SecurityConfig: /api/admin/**).
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // Only the fields the admin needs. The password hash is NOT included.
    public record UserSummary(Long id, String name, String email,
                              String role, String phone, String location) {
    }

    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final PredictionRepository predictionRepository;

    public AdminController(UserRepository userRepository,
                           DonationRepository donationRepository,
                           PredictionRepository predictionRepository) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
        this.predictionRepository = predictionRepository;
    }

    @GetMapping("/users")
    public List<UserSummary> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(u -> new UserSummary(u.getId(), u.getName(), u.getEmail(),
                        u.getRole(), u.getPhone(), u.getLocation()))
                .toList();
    }

    @GetMapping("/donations")
    public List<Donation> getDonations() {
        return donationRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @GetMapping("/predictions")
    public List<Prediction> getPredictions() {
        return predictionRepository.findAll(Sort.by(Sort.Direction.DESC, "predictionDate"));
    }

    @GetMapping("/reports")
    public Map<String, Object> getReports() {
        // Donations by status. EXPIRED is worked out here, because the
        // database keeps those rows as AVAILABLE.
        long availableInDb = donationRepository.countByStatus("AVAILABLE");
        long expired = donationRepository
                .countByStatusAndExpiryDateBefore("AVAILABLE", LocalDate.now());

        Map<String, Long> byStatus = new LinkedHashMap<>();
        byStatus.put("AVAILABLE", availableInDb - expired);
        byStatus.put("CLAIMED", donationRepository.countByStatus("CLAIMED"));
        byStatus.put("COMPLETED", donationRepository.countByStatus("COMPLETED"));
        byStatus.put("EXPIRED", expired);

        // Users by role
        Map<String, Long> byRole = new LinkedHashMap<>();
        byRole.put("DONOR", userRepository.countByRole("DONOR"));
        byRole.put("RECIPIENT", userRepository.countByRole("RECIPIENT"));
        byRole.put("ADMIN", userRepository.countByRole("ADMIN"));

        // Predicted surplus per food type
        List<Map<String, Object>> surplus = new ArrayList<>();
        for (Object[] row : predictionRepository.surplusByFoodType()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("foodType", row[0]);
            item.put("totalSurplus", Math.round(((Number) row[1]).doubleValue() * 100.0) / 100.0);
            item.put("predictions", ((Number) row[2]).longValue());
            surplus.add(item);
        }

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("donationsByStatus", byStatus);
        report.put("usersByRole", byRole);
        report.put("surplusByFoodType", surplus);
        return report;
    }
}