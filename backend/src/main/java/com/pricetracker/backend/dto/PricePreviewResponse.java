package com.pricetracker.backend.dto;

import com.pricetracker.backend.domain.MallType;

/** URL 기준 현재가 미리 확인 응답 */
public record PricePreviewResponse(
	MallType mallType,
	Long currentPrice,
	// 크롤링된 상품 대표 이미지 URL. 크롤링 실패 시 null 이다.
	String imageUrl
) {
}
