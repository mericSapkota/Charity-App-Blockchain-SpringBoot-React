package com.example.demo.dto;

import lombok.Data;

@Data
public class PlatformStatisticsDTO {
    private Long totalDonations;
    private String totalDonationsETH;
    private Long totalCharities;
    private Long totalCampaigns;
    private Long totalDonors;
    private String averageDonation;
    private String platformFees;
}
