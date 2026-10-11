package com.foodwasteai.backend.controller;

import com.foodwasteai.backend.entity.Donation;
import com.foodwasteai.backend.security.AuthUtil;
import com.foodwasteai.backend.service.DonationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "http://localhost:5174"
})
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    // Create a new food donation. The donor is the logged-in user,
    // whatever donorId the browser sends is ignored.
    @PostMapping
    public ResponseEntity<Donation> createDonation(
            @RequestBody Donation donation,
            Authentication authentication) {

        donation.setDonorId(AuthUtil.userId(authentication));

        Donation saved = donationService.createDonation(donation);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // View all available donations
    @GetMapping
    public ResponseEntity<List<Donation>> getAvailableDonations() {
        return ResponseEntity.ok(
                donationService.getAvailableDonations());
    }

    // View donations posted by a donor (own donations only, unless ADMIN)
    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<Donation>> getDonationsByDonor(
            @PathVariable Long donorId,
            Authentication authentication) {

        if (!AuthUtil.isAdmin(authentication)
                && !donorId.equals(AuthUtil.userId(authentication))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only view your own donations");
        }

        return ResponseEntity.ok(
                donationService.getDonationsByDonor(donorId));
    }

    // View donations claimed by a recipient (own claims only, unless ADMIN)
    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<List<Donation>> getDonationsByRecipient(
            @PathVariable Long recipientId,
            Authentication authentication) {

        if (!AuthUtil.isAdmin(authentication)
                && !recipientId.equals(AuthUtil.userId(authentication))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You can only view your own claims");
        }

        return ResponseEntity.ok(
                donationService.getDonationsByRecipient(recipientId));
    }

    // Claim a donation. The recipient is the logged-in user, so no body is needed.
    @PostMapping("/{donationId}/claim")
    public ResponseEntity<Donation> claimDonation(
            @PathVariable Long donationId,
            Authentication authentication) {

        Donation claimed = donationService.claimDonation(
                donationId, AuthUtil.userId(authentication));

        return ResponseEntity.ok(claimed);
    }

    // The donor marks a claimed donation as handed over (COMPLETED).
    @PostMapping("/{donationId}/complete")
    public ResponseEntity<Donation> completeDonation(
            @PathVariable Long donationId,
            Authentication authentication) {

        Donation completed = donationService.completeDonation(
                donationId, AuthUtil.userId(authentication));

        return ResponseEntity.ok(completed);
    }
}