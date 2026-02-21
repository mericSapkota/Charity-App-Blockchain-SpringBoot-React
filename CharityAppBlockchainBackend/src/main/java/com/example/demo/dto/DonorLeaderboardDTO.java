package com.example.demo.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DonorLeaderboardDTO {
    private String donorAddress;
    private BigDecimal totalAmount;
    private Integer donationCount;

    public DonorLeaderboardDTO() {
        this.totalAmount = BigDecimal.ZERO;
        this.donationCount = 0;
    }
}