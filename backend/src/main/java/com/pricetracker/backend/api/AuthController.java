package com.pricetracker.backend.api;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.pricetracker.backend.dto.AuthResponse;
import com.pricetracker.backend.dto.ChangePasswordRequest;
import com.pricetracker.backend.dto.FindIdRequest;
import com.pricetracker.backend.dto.FindIdResponse;
import com.pricetracker.backend.dto.FindPasswordRequest;
import com.pricetracker.backend.dto.FindPasswordResponse;
import com.pricetracker.backend.dto.LoginRequest;
import com.pricetracker.backend.dto.SignupRequest;
import com.pricetracker.backend.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/** 인증 API. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	/** 회원가입 */
	@PostMapping("/signup")
	public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
		AuthResponse response = authService.signup(request);
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	/** 로그인 */
	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	/** 아이디 찾기 */
	@PostMapping("/find-id")
	public FindIdResponse findId(@Valid @RequestBody FindIdRequest request) {
		return authService.findUserId(request);
	}

	/** 비밀번호 찾기 */
	@PostMapping("/find-password")
	public FindPasswordResponse findPassword(@Valid @RequestBody FindPasswordRequest request) {
		return authService.findPassword(request);
	}

	/** 비밀번호 변경 */
	@PostMapping("/change-password")
	public AuthResponse changePassword(
			@RequestHeader("Authorization") String authorizationHeader,
			@Valid @RequestBody ChangePasswordRequest request) {
		String userId = extractUserIdFromToken(authorizationHeader);
		return authService.changePassword(userId, request);
	}

	/** 로그아웃 */
	@PostMapping("/logout")
	public ResponseEntity<Void> logout() {
		authService.logout();
		return ResponseEntity.noContent().build();
	}

	/** Bearer 토큰의 payload(userId)를 추출 */
	private String extractUserIdFromToken(String authorizationHeader) {
		if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증 토큰이 필요합니다.");
		}
		try {
			String token = authorizationHeader.substring(7);
			String encodedPayload = token.split("\\.")[0];
			String payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
			// payload 형식: userId:loginId:expiresAt
			return payload.split(":")[1];
		} catch (Exception e) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다.");
		}
	}
}
