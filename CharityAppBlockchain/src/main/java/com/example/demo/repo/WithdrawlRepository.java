package com.example.demo.repo;

import com.example.demo.entity.Withdrawal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WithdrawlRepository extends JpaRepository<Withdrawal, Long> {
    Optional<Withdrawal> findByTxHash(String txHash);

    List<Withdrawal> findByCharityId(Long charityId);
}

