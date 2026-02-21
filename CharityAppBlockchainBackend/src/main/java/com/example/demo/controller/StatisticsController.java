package com.example.demo.controller;

import com.example.demo.dto.PlatformStatisticsDTO;
import com.example.demo.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StatisticsController {
    private final DonationService donationService;

    @GetMapping
    public ResponseEntity<PlatformStatisticsDTO> getPlatformStatistics() {
        PlatformStatisticsDTO stats = donationService.getPlatformStatistics();
        return ResponseEntity.ok(stats);

    }
}