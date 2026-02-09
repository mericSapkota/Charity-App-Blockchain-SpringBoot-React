package com.example.demo.service;

import com.example.demo.dto.DonationDTO;
import com.example.demo.dto.PlatformStatisticsDTO;
import com.example.demo.entity.Donation;
import com.example.demo.repo.DonationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationService {

    @Autowired
    private final DonationRepository donationRepository;

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
