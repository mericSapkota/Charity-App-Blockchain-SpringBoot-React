package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "charity_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CharityRequest {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "wallet_address", nullable = false, length = 42)
        private String walletAddress;

        @Column(name = "charity_name", nullable = false)
        private String charityName;

        @Column(columnDefinition = "TEXT", nullable = false)
        private String description;

        @Column(nullable = false)
        private String email;

        @Column(nullable = false)
        private String verificationDocumentUrl;

        @Column(name = "website_url")
        private String websiteUrl;

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private RequestStatus status = RequestStatus.PENDING;

        @Column(name="logo_url")
        private String logoUrl;


        @Column(name = "submitted_at", nullable = false)
        private LocalDateTime submittedAt = LocalDateTime.now();

        public static enum RequestStatus {
            PENDING, APPROVED, REJECTED
        }

}
