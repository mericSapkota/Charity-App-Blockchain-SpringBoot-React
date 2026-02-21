package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WithdrawalDTO {
    private String txHash;
    private Long charityId;
    private String charityName;
    private String amount;
    private String fee;
    private String netAmount;
    private LocalDateTime timestamp;
    private Long blockNumber;
    private String toAddress;
}
