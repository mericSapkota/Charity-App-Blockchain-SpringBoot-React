package com.example.demo.repo;

import com.example.demo.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTxHash(String txHash);

    List<Transaction> findByFromAddress(String fromAddress);

    List<Transaction> findByType(String type);

    List<Transaction> findByStatus(String status);
}
