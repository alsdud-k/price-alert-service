package com.pricetracker.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pricetracker.backend.domain.MallType;
import com.pricetracker.backend.domain.Product;
import com.pricetracker.backend.domain.User;
import com.pricetracker.backend.dto.PriceHistoryResponse;
import com.pricetracker.backend.dto.ProductCreateRequest;
import com.pricetracker.backend.dto.ProductResponse;
import com.pricetracker.backend.exception.ResourceNotFoundException;
import com.pricetracker.backend.repository.AlertRepository;
import com.pricetracker.backend.repository.PriceHistoryRepository;
import com.pricetracker.backend.repository.ProductRepository;
import com.pricetracker.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 관심 상품 관련 비즈니스 로직.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

	private final ProductRepository productRepository;
	private final AlertRepository alertRepository;
	private final PriceHistoryRepository priceHistoryRepository;
	private final PriceCrawlingService priceCrawlingService;
	private final PriceCheckService priceCheckService;
	private final UserRepository userRepository;

	/** 관심 상품 등록. 등록 시점에 최초 현재가를 크롤링한다. */
	@Transactional
	public ProductResponse createProduct(ProductCreateRequest request, String loginUserId) {
		User user = findUserOrThrow(loginUserId);

		MallType mallType = MallType.fromUrl(request.url());

		Optional<Long> initialPrice = priceCrawlingService.crawlPrice(request.url(), mallType);
		Optional<String> imageUrl = priceCrawlingService.crawlImage(request.url(), mallType);

		Product product = new Product(
			request.name(),
			request.url(),
			mallType,
			initialPrice.orElse(null),
			request.targetPrice(),
			user.getId()
		);
		product.setImageUrl(imageUrl.orElse(null));
		if (request.alertEnabled() != null) {
			product.setAlertEnabled(request.alertEnabled());
		}
		productRepository.save(product);

		initialPrice.ifPresent(price -> priceCheckService.recordAndEvaluate(product, price));

		log.info("상품 등록 - id={}, name={}, userId={}, mallType={}, currentPrice={}",
			product.getId(), product.getName(), loginUserId, mallType, product.getCurrentPrice());

		return ProductResponse.from(product);
	}

	/** 등록된 관심 상품 목록 (해당 사용자 것만, 최신 등록순) */
	@Transactional(readOnly = true)
	public List<ProductResponse> getProducts(String loginUserId) {
		User user = findUserOrThrow(loginUserId);
		return productRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
			.map(ProductResponse::from)
			.toList();
	}

	/** 관심 상품 단건 조회 */
	@Transactional(readOnly = true)
	public ProductResponse getProduct(Long productId, String loginUserId) {
		Product product = findProductOrThrow(productId);
		verifyOwner(product, loginUserId);
		return ProductResponse.from(product);
	}

	/** 목표 가격 수정 */
	@Transactional
	public ProductResponse updateTargetPrice(Long productId, Long targetPrice, String loginUserId) {
		Product product = findProductOrThrow(productId);
		verifyOwner(product, loginUserId);
		product.setTargetPrice(targetPrice);
		return ProductResponse.from(product);
	}

	/** 알림 활성화 여부 수정 */
	@Transactional
	public ProductResponse updateAlertEnabled(Long productId, Boolean alertEnabled, String loginUserId) {
		Product product = findProductOrThrow(productId);
		verifyOwner(product, loginUserId);
		product.setAlertEnabled(alertEnabled);
		return ProductResponse.from(product);
	}

	/** 관심 상품 삭제 */
	@Transactional
	public void deleteProduct(Long productId, String loginUserId) {
		Product product = findProductOrThrow(productId);
		verifyOwner(product, loginUserId);
		alertRepository.deleteByProductId(productId);
		priceHistoryRepository.deleteByProductId(productId);
		productRepository.delete(product);
	}

	/** 가격 변동 이력 (그래프용, checkedAt 오름차순) */
	@Transactional(readOnly = true)
	public List<PriceHistoryResponse> getPriceHistory(Long productId, String loginUserId) {
		Product product = findProductOrThrow(productId);
		verifyOwner(product, loginUserId);
		return priceHistoryRepository.findByProductIdOrderByCheckedAtAsc(productId).stream()
			.map(PriceHistoryResponse::from)
			.toList();
	}

	private Product findProductOrThrow(Long productId) {
		return productRepository.findById(productId)
			.orElseThrow(() -> new ResourceNotFoundException("상품을 찾을 수 없습니다. id=" + productId));
	}

	private User findUserOrThrow(String loginUserId) {
		return userRepository.findByUserId(loginUserId)
			.orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));
	}

	private void verifyOwner(Product product, String loginUserId) {
		User user = findUserOrThrow(loginUserId);
		if (!product.getUserId().equals(user.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "해당 상품에 접근할 권한이 없습니다.");
		}
	}
}
