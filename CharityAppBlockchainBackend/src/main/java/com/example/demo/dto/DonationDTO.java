package com.example.demo.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DonationDTO {
    private String txHash;
    private String donorAddress;
    private Long charityId;
    private String charityName;
    private Long campaignId;
    private String campaignTitle;
    private String amount;
    private BigDecimal amountInUSD;
    private LocalDateTime timestamp;
    private Long blockNumber;
    private String message;
    private Boolean isAnonymous;
}
