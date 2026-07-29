package com.pricetracker.backend.api;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pricetracker.backend.dto.AlertEnabledUpdateRequest;
import com.pricetracker.backend.dto.PriceHistoryResponse;
import com.pricetracker.backend.dto.ProductCreateRequest;
import com.pricetracker.backend.dto.ProductResponse;
import com.pricetracker.backend.dto.TargetPriceUpdateRequest;
import com.pricetracker.backend.service.AuthTokenService;
import com.pricetracker.backend.service.ProductService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 관심 상품 API.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

	private final ProductService productService;
	private final AuthTokenService authTokenService;

	/** 관심 상품 등록 (등록 시 최초 현재가 크롤링) */
	@PostMapping
	public ResponseEntity<ProductResponse> create(
			@RequestHeader("Authorization") String auth,
			@Valid @RequestBody ProductCreateRequest request) {
		String userId = authTokenService.extractUserId(auth);
		ProductResponse response = productService.createProduct(request, userId);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	/** 관심 상품 전체 목록 */
	@GetMapping
	public List<ProductResponse> list(@RequestHeader("Authorization") String auth) {
		String userId = authTokenService.extractUserId(auth);
		return productService.getProducts(userId);
	}

	/** 관심 상품 단건 조회 (상세 화면용) */
	@GetMapping("/{id}")
	public ProductResponse get(
			@RequestHeader("Authorization") String auth,
			@PathVariable Long id) {
		String userId = authTokenService.extractUserId(auth);
		return productService.getProduct(id, userId);
	}

	/** 목표 가격 수정 */
	@PatchMapping("/{id}/target-price")
	public ProductResponse updateTargetPrice(
			@RequestHeader("Authorization") String auth,
			@PathVariable Long id,
			@Valid @RequestBody TargetPriceUpdateRequest request) {
		String userId = authTokenService.extractUserId(auth);
		return productService.updateTargetPrice(id, request.targetPrice(), userId);
	}

	/** 알림 활성화 여부 수정 */
	@PatchMapping("/{id}/alert-enabled")
	public ProductResponse updateAlertEnabled(
			@RequestHeader("Authorization") String auth,
			@PathVariable Long id,
			@Valid @RequestBody AlertEnabledUpdateRequest request) {
		String userId = authTokenService.extractUserId(auth);
		return productService.updateAlertEnabled(id, request.alertEnabled(), userId);
	}

	/** 관심 상품 삭제 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(
			@RequestHeader("Authorization") String auth,
			@PathVariable Long id) {
		String userId = authTokenService.extractUserId(auth);
		productService.deleteProduct(id, userId);
		return ResponseEntity.noContent().build();
	}

	/** 가격 변동 이력 (그래프용) */
	@GetMapping("/{id}/price-history")
	public List<PriceHistoryResponse> priceHistory(
			@RequestHeader("Authorization") String auth,
			@PathVariable Long id) {
		String userId = authTokenService.extractUserId(auth);
		return productService.getPriceHistory(id, userId);
	}
}
