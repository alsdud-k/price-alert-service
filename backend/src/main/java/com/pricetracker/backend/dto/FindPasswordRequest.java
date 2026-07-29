package com.pricetracker.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** 비밀번호 찾기 요청 */
public record FindPasswordRequest(

	@NotBlank(message = "아이디는 필수입니다.")
	String userId,

	@NotBlank(message = "이메일은 필수입니다.")
	@Email(message = "올바른 이메일 형식이 아닙니다.")
	String email
) {
}
