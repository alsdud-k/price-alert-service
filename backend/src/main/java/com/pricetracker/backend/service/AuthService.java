package com.pricetracker.backend.service;

import java.security.SecureRandom;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pricetracker.backend.domain.User;
import com.pricetracker.backend.dto.AuthResponse;
import com.pricetracker.backend.dto.FindIdRequest;
import com.pricetracker.backend.dto.FindIdResponse;
import com.pricetracker.backend.dto.ChangePasswordRequest;
import com.pricetracker.backend.dto.FindPasswordRequest;
import com.pricetracker.backend.dto.FindPasswordResponse;
import com.pricetracker.backend.dto.LoginRequest;
import com.pricetracker.backend.dto.SignupRequest;
import com.pricetracker.backend.dto.UserResponse;
import com.pricetracker.backend.exception.DuplicateResourceException;
import com.pricetracker.backend.exception.InvalidCredentialsException;
import com.pricetracker.backend.exception.ResourceNotFoundException;
import com.pricetracker.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/** 인증 관련 비즈니스 로직. */
@Service
@RequiredArgsConstructor
public class AuthService {

	private static final String TEMP_PW_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
	private static final int TEMP_PW_LENGTH = 10;
	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private final UserRepository userRepository;
	private final AuthTokenService authTokenService;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	/** 회원가입 */
	@Transactional
	public AuthResponse signup(SignupRequest request) {
		if (userRepository.existsByUserId(request.userId())) {
			throw new DuplicateResourceException("이미 사용 중인 아이디입니다.");
		}
		if (userRepository.existsByEmail(request.email())) {
			throw new DuplicateResourceException("이미 사용 중인 이메일입니다.");
		}

		User user = new User(
			request.userId(),
			request.name(),
			request.email(),
			passwordEncoder.encode(request.password())
		);
		userRepository.save(user);

		return toAuthResponse(user);
	}

	/** 로그인 */
	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByUserId(request.userId())
			.orElseThrow(() -> new InvalidCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다."));

		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new InvalidCredentialsException("아이디 또는 비밀번호가 올바르지 않습니다.");
		}

		return toAuthResponse(user);
	}

	/** 아이디 찾기 */
	@Transactional(readOnly = true)
	public FindIdResponse findUserId(FindIdRequest request) {
		User user = userRepository.findByNameAndEmail(request.name(), request.email())
			.orElseThrow(() -> new ResourceNotFoundException("일치하는 회원 정보를 찾을 수 없습니다."));
		return new FindIdResponse(user.getUserId());
	}

	/** 비밀번호 찾기 — 임시 비밀번호 발급 후 DB 반영 */
	@Transactional
	public FindPasswordResponse findPassword(FindPasswordRequest request) {
		User user = userRepository.findByUserIdAndEmail(request.userId(), request.email())
			.orElseThrow(() -> new ResourceNotFoundException("일치하는 회원 정보를 찾을 수 없습니다."));

		String temporaryPassword = generateTemporaryPassword();
		user.updatePasswordHash(passwordEncoder.encode(temporaryPassword), true);

		return new FindPasswordResponse(temporaryPassword);
	}

	/** 비밀번호 변경 */
	@Transactional
	public AuthResponse changePassword(String userId, ChangePasswordRequest request) {
		User user = userRepository.findByUserId(userId)
			.orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

		if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
			throw new InvalidCredentialsException("현재 비밀번호가 올바르지 않습니다.");
		}

		user.updatePasswordHash(passwordEncoder.encode(request.newPassword()), false);

		return toAuthResponse(user);
	}

	/** 로그아웃 */
	public void logout() {
		// 현재 토큰은 서버에 저장하지 않으므로, 클라이언트 세션 삭제로 로그아웃을 완료한다.
	}

	private String generateTemporaryPassword() {
		StringBuilder sb = new StringBuilder(TEMP_PW_LENGTH);
		for (int i = 0; i < TEMP_PW_LENGTH; i++) {
			sb.append(TEMP_PW_CHARS.charAt(SECURE_RANDOM.nextInt(TEMP_PW_CHARS.length())));
		}
		return sb.toString();
	}

	private AuthResponse toAuthResponse(User user) {
		return AuthResponse.bearer(
			authTokenService.createToken(user),
			UserResponse.from(user)
		);
	}
}
