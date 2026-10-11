package com.foodwasteai.backend.service;

import com.foodwasteai.backend.entity.Donation;
import com.foodwasteai.backend.repository.DonationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.springframework.http.HttpStatus.*;

@Service
public class DonationService {

    private final DonationRepository donationRepository;

    public DonationService(DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    public Donation createDonation(Donation donation) {
        if (donation.getDonorId() == null
                || donation.getDonorId() <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Valid donor ID is required");
        }

        if (donation.getFoodType() == null
                || donation.getFoodType().isBlank()) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Food type is required");
        }

        if (donation.getQuantity() == null
                || !Double.isFinite(donation.getQuantity())
                || donation.getQuantity() <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Quantity must be greater than zero");
        }

        if (donation.getPickupLocation() == null
                || donation.getPickupLocation().isBlank()) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Pickup location is required");
        }

        if (donation.getExpiryDate() == null
                || donation.getExpiryDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Expiry date cannot be in the past");
        }

        donation.setId(null);
        donation.setRecipientId(null);
        donation.setStatus("AVAILABLE");

        return donationRepository.save(donation);
    }

    public List<Donation> getAvailableDonations() {
        return donationRepository
                .findByStatusOrderByCreatedAtDesc("AVAILABLE")
                .stream()
                .filter(d -> !d.getExpiryDate().isBefore(LocalDate.now()))
                .toList();
    }

    public List<Donation> getDonationsByDonor(Long donorId) {
        if (donorId == null || donorId <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Valid donor ID is required");
        }

        return donationRepository
                .findByDonorIdOrderByCreatedAtDesc(donorId);
    }

    public List<Donation> getDonationsByRecipient(Long recipientId) {
        if (recipientId == null || recipientId <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Valid recipient ID is required");
        }

        return donationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId);
    }

    @Transactional
    public Donation claimDonation(Long donationId, Long recipientId) {
        if (donationId == null || donationId <= 0
                || recipientId == null || recipientId <= 0) {
            throw new ResponseStatusException(
                    BAD_REQUEST, "Valid donation and recipient IDs are required");
        }

        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND, "Donation not found"));

        if (!"AVAILABLE".equals(donation.getStatus())
                || donation.getExpiryDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    CONFLICT, "This donation is no longer available");
        }

        donation.setRecipientId(recipientId);
        donation.setStatus("CLAIMED");

        return donationRepository.save(donation);
    }

    // The donor confirms the food was handed over: CLAIMED -> COMPLETED.
    @Transactional
    public Donation completeDonation(Long donationId, Long donorId) {
        Donation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResponseStatusException(
                        NOT_FOUND, "Donation not found"));

        if (!donation.getDonorId().equals(donorId)) {
            throw new ResponseStatusException(
                    FORBIDDEN, "You can only complete your own donations");
        }

        if (!"CLAIMED".equals(donation.getStatus())) {
            throw new ResponseStatusException(
                    CONFLICT, "Only a claimed donation can be marked as completed");
        }

        donation.setStatus("COMPLETED");

        return donationRepository.save(donation);
    }
}