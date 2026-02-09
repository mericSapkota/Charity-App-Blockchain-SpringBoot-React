package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String txHash;

    @Column(nullable = false)
    private String donorAddress;

    @Column(nullable = false)
    private Long charityId;

    private String charityName;

    private Long campaignId;

    private String campaignTitle;

    @Column(nullable = false)
    private String amount; // Stored as string to preserve precision

    private BigDecimal amountInUSD;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private Long blockNumber;

    @Column(length = 1000)
    private String message;

    @Column(nullable = false)
    private Boolean isAnonymous = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
