package com.example.demo.entity;


import lombok.Data;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "withdrawals")
@Data
public class Withdrawal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String txHash;

    @Column(nullable = false)
    private Long charityId;

    private String charityName;

    @Column(nullable = false)
    private String amount;

    private String fee;

    private String netAmount;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private Long blockNumber;

    private String toAddress;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}