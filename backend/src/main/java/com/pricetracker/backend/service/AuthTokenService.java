package com.pricetracker.backend.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pricetracker.backend.domain.User;

/** 의존성 없이 쓰는 간단한 서명 토큰 발급기. */
@Service
public class AuthTokenService {

	private final String secret;
	private final long expirationSeconds;

	public AuthTokenService(
			@Value("${app.auth.token-secret:change-this-dev-secret}") String secret,
			@Value("${app.auth.token-expiration-seconds:86400}") long expirationSeconds) {
		this.secret = secret;
		this.expirationSeconds = expirationSeconds;
	}

	public String createToken(User user) {
		long expiresAt = Instant.now().plusSeconds(expirationSeconds).getEpochSecond();
		String payload = user.getId() + ":" + user.getUserId() + ":" + expiresAt;
		String encodedPayload = base64Url(payload.getBytes(StandardCharsets.UTF_8));
		String signature = sign(encodedPayload);

		return encodedPayload + "." + signature;
	}

	private String sign(String payload) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			return base64Url(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
		} catch (Exception e) {
			throw new IllegalStateException("토큰 생성에 실패했습니다.", e);
		}
	}

	/** Bearer 헤더에서 userId(loginId) 추출 */
	public String extractUserId(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 토큰이 필요합니다.");
		}
		try {
			String token = authorizationHeader.substring(7);
			String encodedPayload = token.split("\\.")[0];
			String payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
			// payload 형식: dbId:userId:expiresAt
			return payload.split(":")[1];
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
		}
	}

	private String base64Url(byte[] bytes) {
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}
}
