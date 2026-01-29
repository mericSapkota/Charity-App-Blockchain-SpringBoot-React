package com.example.demo.controller;

import com.example.demo.dto.CampaignDto;
import com.example.demo.entity.Campaign;
import com.example.demo.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
public class CampaignController {

    @Autowired
    private CampaignService campaignService;

    @PostMapping("/api/campaign")
    public ResponseEntity<Campaign> postData(@RequestBody Campaign c) {
        System.out.println("hiiiiiiii");
        c.setStatus("ACTIVE");
        System.out.println("campaign controller " + c);
        Campaign cr = campaignService.saveCampaign(c);
        return ResponseEntity.ok(cr);
    }

    @GetMapping("/api/campaign/{walletAddress}")
    public ResponseEntity<List<Campaign>> getCampaignByWallet(@PathVariable("walletAddress") String walletAddress) {
        List<Campaign> campaignByWallet = campaignService.getCampaignByWallet(walletAddress);
        return ResponseEntity.ok(campaignByWallet);
    }

    @GetMapping("api/campaign/active")
    public ResponseEntity<List<Campaign>> getActiveCampaigns() {
        List<Campaign> campaigns = campaignService.getCampaignByActive();
        return ResponseEntity.ok(campaigns);
    }
}
