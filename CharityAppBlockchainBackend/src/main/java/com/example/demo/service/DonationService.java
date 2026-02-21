package com.example.demo.service;

import com.example.demo.dto.DonationDTO;
import com.example.demo.dto.DonorLeaderboardDTO;
import com.example.demo.dto.PlatformStatisticsDTO;
import com.example.demo.entity.Donation;
import com.example.demo.repo.DonationRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {


    private final DonationRepository donationRepository;


    private final PDFCertificateService pdfCertificateService;

    @Transactional
    public DonationDTO saveDonation(DonationDTO dto) {
        Donation donation = new Donation();
        donation.setTxHash(dto.getTxHash());
        donation.setDonorAddress(dto.getDonorAddress());
        donation.setCharityId(dto.getCharityId());
        donation.setCharityName(dto.getCharityName());
        donation.setCampaignId(dto.getCampaignId());
        donation.setCampaignTitle(dto.getCampaignTitle());
        donation.setAmount(dto.getAmount());
        donation.setAmountInUSD(dto.getAmountInUSD());
        donation.setTimestamp(dto.getTimestamp());
        donation.setBlockNumber(dto.getBlockNumber());
        donation.setMessage(dto.getMessage());
        donation.setIsAnonymous(dto.getIsAnonymous());

        donation = donationRepository.save(donation);
        return convertToDTO(donation);
    }

    public List<DonationDTO> getUserDonations(String walletAddress) {
        return donationRepository.findByDonorAddress(walletAddress)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DonationDTO> getCharityDonations(Long charityId) {
        return donationRepository.findByCharityId(charityId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<DonationDTO> getCampaignDonations(Long campaignId) {
        return donationRepository.findByCampaignId(campaignId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public DonationDTO getDonationByTxHash(String txHash) {
        return donationRepository.findByTxHash(txHash)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public PlatformStatisticsDTO getPlatformStatistics() {
        PlatformStatisticsDTO stats = new PlatformStatisticsDTO();

        Long totalDonations = donationRepository.count();
        Double totalAmount = donationRepository.getTotalDonationAmount();
        Long uniqueDonors = donationRepository.countUniqueDonors();

        stats.setTotalDonations(totalDonations);
        stats.setTotalDonationsETH(totalAmount != null ? totalAmount.toString() : "0");
        stats.setTotalDonors(uniqueDonors);

        if (totalDonations > 0 && totalAmount != null) {
            stats.setAverageDonation(String.valueOf(totalAmount / totalDonations));
        } else {
            stats.setAverageDonation("0");
        }

        return stats;
    }


    public byte[] exportDonationsAsCSV(String walletAddress) {
        List<Donation> donations = donationRepository.findByDonorAddress(walletAddress);

        StringBuilder csv = new StringBuilder();

        // CSV Header
        csv.append("Date,Transaction Hash,Charity,Campaign,Amount (ETH),Block Number,Message\n");

        // CSV Rows
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        for (Donation donation : donations) {
            csv.append(escapeCSV(donation.getTimestamp().format(formatter))).append(",");
            csv.append(escapeCSV(donation.getTxHash())).append(",");
            csv.append(escapeCSV(donation.getCharityName())).append(",");
            csv.append(escapeCSV(donation.getCampaignTitle() != null ? donation.getCampaignTitle() : "Direct Donation")).append(",");
            csv.append(escapeCSV(donation.getAmount())).append(",");
            csv.append(donation.getBlockNumber() != null ? donation.getBlockNumber() : "").append(",");
            csv.append(escapeCSV(donation.getMessage() != null ? donation.getMessage() : "")).append("\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Generate donation certificate as PDF
     * Note: This is a simple text-based implementation.
     * For production, use libraries like iText or Apache PDFBox
     */
    public byte[] generateCertificatePDF(String txHash) {
        Donation donation = donationRepository.findByTxHash(txHash)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        return pdfCertificateService.createPDF(donation);
    }

    /**
     * Get donor leaderboard
     */
    public List<DonorLeaderboardDTO> getDonorLeaderboard(int limit) {
        // Get all donations grouped by donor
        Map<String, DonorLeaderboardDTO> donorMap = new HashMap<>();

        List<Donation> allDonations = donationRepository.findAll();

        for (Donation donation : allDonations) {
            if (donation.getIsAnonymous()) {
                continue; // Skip anonymous donations
            }

            String donor = donation.getDonorAddress();
            DonorLeaderboardDTO dto = donorMap.getOrDefault(donor, new DonorLeaderboardDTO());
            dto.setDonorAddress(donor);
            dto.setDonationCount(dto.getDonationCount() + 1);

            // Sum amounts
            BigDecimal currentAmount = dto.getTotalAmount() != null
                    ? dto.getTotalAmount()
                    : BigDecimal.ZERO;
            BigDecimal donationAmount = new BigDecimal(donation.getAmount());
            dto.setTotalAmount(currentAmount.add(donationAmount));

            donorMap.put(donor, dto);
        }

        // Sort by total amount and limit
        return donorMap.values().stream()
                .sorted((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    private String escapeCSV(String value) {
        if (value == null) return "";

        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }

    private DonationDTO convertToDTO(Donation donation) {
        DonationDTO dto = new DonationDTO();
        dto.setTxHash(donation.getTxHash());
        dto.setDonorAddress(donation.getDonorAddress());
        dto.setCharityId(donation.getCharityId());
        dto.setCharityName(donation.getCharityName());
        dto.setCampaignId(donation.getCampaignId());
        dto.setCampaignTitle(donation.getCampaignTitle());
        dto.setAmount(donation.getAmount());
        dto.setAmountInUSD(donation.getAmountInUSD());
        dto.setTimestamp(donation.getTimestamp());
        dto.setBlockNumber(donation.getBlockNumber());
        dto.setMessage(donation.getMessage());
        dto.setIsAnonymous(donation.getIsAnonymous());
        return dto;
    }
}
