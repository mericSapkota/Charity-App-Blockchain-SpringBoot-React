package com.example.demo.controller;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private final TransactionService transactionService;

    @PostMapping
    public ResponseEntity<TransactionDTO> createTransaction(@RequestBody TransactionDTO transactionDTO) {
        TransactionDTO saved = transactionService.saveTransaction(transactionDTO);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/user/{walletAddress}")
    public ResponseEntity<List<TransactionDTO>> getUserTransactions(@PathVariable String walletAddress) {
        List<TransactionDTO> transactions = transactionService.getUserTransactions(walletAddress);
        return ResponseEntity.ok(transactions);
    }
}
