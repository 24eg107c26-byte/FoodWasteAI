package com.foodwasteai.backend.repository;

import com.foodwasteai.backend.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByStatusOrderByCreatedAtDesc(String status);

    List<Donation> findByDonorIdOrderByCreatedAtDesc(Long donorId);

    List<Donation> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    long countByStatus(String status);

    // Used for reports: AVAILABLE donations whose expiry date has passed.
    long countByStatusAndExpiryDateBefore(String status, LocalDate date);

}