package com.pricetracker.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pricetracker.backend.domain.Alert;

public interface AlertRepository extends JpaRepository<Alert, Long> {

	// 알림 내역을 최신순으로 조회
	List<Alert> findAllByOrderByCreatedAtDesc();
}
