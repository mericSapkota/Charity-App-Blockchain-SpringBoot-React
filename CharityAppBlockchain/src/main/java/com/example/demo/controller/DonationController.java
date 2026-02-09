package com.example.demo.controller;

import com.example.demo.dto.DonationDTO;
import com.example.demo.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    public ResponseEntity<DonationDTO> createDonation(@RequestBody DonationDTO donationDTO) {
        DonationDTO saved = donationService.saveDonation(donationDTO);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{walletAddress}")
    public ResponseEntity<List<DonationDTO>> getUserDonations(@PathVariable String walletAddress) {
        List<DonationDTO> donations = donationService.getUserDonations(walletAddress);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/charity/{charityId}")
    public ResponseEntity<List<DonationDTO>> getCharityDonations(@PathVariable Long charityId) {
        List<DonationDTO> donations = donationService.getCharityDonations(charityId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/campaign/{campaignId}")
    public ResponseEntity<List<DonationDTO>> getCampaignDonations(@PathVariable Long campaignId) {
        List<DonationDTO> donations = donationService.getCampaignDonations(campaignId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/receipt/{txHash}")
    public ResponseEntity<DonationDTO> getDonationReceipt(@PathVariable String txHash) {
        DonationDTO donation = donationService.getDonationByTxHash(txHash);
        return ResponseEntity.ok(donation);
    }
}