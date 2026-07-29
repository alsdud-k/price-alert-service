package com.pricetracker.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pricetracker.backend.domain.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

	// 알림 활성화된 상품만 조회 (스케줄러 대상)
	List<Product> findByAlertEnabledTrue();

	// 전체 목록을 최신 등록순으로 조회
	List<Product> findAllByOrderByCreatedAtDesc();

	// 특정 사용자의 목록을 최신 등록순으로 조회
	List<Product> findByUserIdOrderByCreatedAtDesc(Long userId);
}
