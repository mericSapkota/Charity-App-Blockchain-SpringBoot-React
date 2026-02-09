package com.example.demo.repo;

import com.example.demo.entity.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    Optional<Donation> findByTxHash(String txHash);

    List<Donation> findByDonorAddress(String donorAddress);

    List<Donation> findByCharityId(Long charityId);

    List<Donation> findByCampaignId(Long campaignId);

    @Query("SELECT COUNT(DISTINCT d.donorAddress) FROM Donation d")
    Long countUniqueDonors();

    @Query("SELECT SUM(CAST(d.amount AS double)) FROM Donation d")
    Double getTotalDonationAmount();
}
