package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private String txHash;
    private String fromAddress;
    private String toAddress;
    private String amount;
    private String type; // donation, withdrawal, charity_registration, etc.
    private Long charityId;
    private Long campaignId;
    private String status; // pending, success, failed
    private Long blockNumber;
    private LocalDateTime timestamp;
    private String metadata; // JSON string for additional data
}