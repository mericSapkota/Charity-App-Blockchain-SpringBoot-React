package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class CampaignDto {
    private Long id;
    private String title;
    private String description;
    private double targetAmount;
    private double raisedAmount;
    private String walletAddress;
    private String status;

}
