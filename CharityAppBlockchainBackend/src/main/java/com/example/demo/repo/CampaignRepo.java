package com.example.demo.repo;

import com.example.demo.entity.Campaign;
import com.example.demo.entity.CharityRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepo extends JpaRepository<Campaign, Long> {

    List<Campaign> findAllByWalletAddress(String walletAddress);

    List<Campaign> findAllByStatus(String active);
}
