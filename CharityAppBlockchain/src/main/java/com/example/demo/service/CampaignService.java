package com.example.demo.service;

import com.example.demo.entity.Campaign;
import com.example.demo.repo.CampaignRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CampaignService {

    @Autowired
    private CampaignRepo cr;

    public Campaign saveCampaign(Campaign campaign) {
        return cr.save(campaign);
    }

    public List<Campaign> getCampaignByWallet(String walletAddress) {

        return cr.findAllByWalletAddress(walletAddress);
    }

    public List<Campaign> getCampaignByActive() {
        return cr.findAllByStatus("ACTIVE");
    }
}
