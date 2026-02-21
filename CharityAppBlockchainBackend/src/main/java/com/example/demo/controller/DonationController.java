package com.example.demo.controller;

import com.example.demo.dto.DonationDTO;
import com.example.demo.service.DonationService;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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

    @GetMapping("/export/{walletAddress}")
    public ResponseEntity<Resource> exportDonationHistory(@PathVariable String walletAddress) {
        byte[] csvData = donationService.exportDonationsAsCSV(walletAddress);

        ByteArrayResource resource = new ByteArrayResource(csvData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=donation-history-" + walletAddress.substring(0, 10) + ".csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .contentLength(csvData.length)
                .body(resource);
    }

    /**
     * Generate donation certificate PDF
     */
    @GetMapping("/certificate/{txHash}")
    public ResponseEntity<Resource> generateDonationCertificate(@PathVariable String txHash) {
        byte[] pdfData = donationService.generateCertificatePDF(txHash);

        ByteArrayResource resource = new ByteArrayResource(pdfData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=donation-certificate-" + txHash.substring(0, 10) + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfData.length)
                .body(resource);
    }
}