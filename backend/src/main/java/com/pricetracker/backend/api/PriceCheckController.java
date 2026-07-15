package com.pricetracker.backend.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pricetracker.backend.service.PriceCheckService;

import lombok.RequiredArgsConstructor;

/**
 * 가격 체크 수동 실행 API.
 * 스케줄러(30분 간격)를 기다리지 않고 즉시 가격 체크를 돌려볼 수 있게 하는 개발/테스트용 엔드포인트.
 */
@RestController
@RequestMapping("/api/price-check")
@RequiredArgsConstructor
public class PriceCheckController {

	private final PriceCheckService priceCheckService;

	/** 알림 활성화된 모든 상품의 가격을 즉시 재체크한다. */
	@PostMapping
	public String runNow() {
		priceCheckService.checkAllPrices();
		return "price check executed";
	}
}
