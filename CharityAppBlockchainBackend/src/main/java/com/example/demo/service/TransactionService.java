package com.example.demo.service;

import com.example.demo.dto.TransactionDTO;
import com.example.demo.entity.Transaction;
import com.example.demo.repo.TransactionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionDTO saveTransaction(TransactionDTO dto) {
        Transaction transaction = new Transaction();
        transaction.setTxHash(dto.getTxHash());
        transaction.setFromAddress(dto.getFromAddress());
        transaction.setToAddress(dto.getToAddress());
        transaction.setAmount(dto.getAmount());
        transaction.setType(dto.getType());
        transaction.setCharityId(dto.getCharityId());
        transaction.setCampaignId(dto.getCampaignId());
        transaction.setStatus(dto.getStatus());
        transaction.setBlockNumber(dto.getBlockNumber());
        transaction.setTimestamp(dto.getTimestamp());
        transaction.setMetadata(dto.getMetadata());

        transaction = transactionRepository.save(transaction);
        return convertToDTO(transaction);
    }

    public List<TransactionDTO> getUserTransactions(String walletAddress) {
        return transactionRepository.findByFromAddress(walletAddress)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private TransactionDTO convertToDTO(Transaction transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setTxHash(transaction.getTxHash());
        dto.setFromAddress(transaction.getFromAddress());
        dto.setToAddress(transaction.getToAddress());
        dto.setAmount(transaction.getAmount());
        dto.setType(transaction.getType());
        dto.setCharityId(transaction.getCharityId());
        dto.setCampaignId(transaction.getCampaignId());
        dto.setStatus(transaction.getStatus());
        dto.setBlockNumber(transaction.getBlockNumber());
        dto.setTimestamp(transaction.getTimestamp());
        dto.setMetadata(transaction.getMetadata());
        return dto;
    }
}
