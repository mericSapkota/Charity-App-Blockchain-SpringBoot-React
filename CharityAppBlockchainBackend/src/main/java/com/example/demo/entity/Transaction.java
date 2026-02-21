package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String txHash;

    @Column(nullable = false)
    private String fromAddress;

    private String toAddress;

    @Column(nullable = false)
    private String amount;

    @Column(nullable = false)
    private String type;

    private Long charityId;

    private Long campaignId;

    @Column(nullable = false)
    private String status;

    private Long blockNumber;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 2000)
    private String metadata;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}