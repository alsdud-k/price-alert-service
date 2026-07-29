package com.pricetracker.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** 아이디 찾기 요청 */
public record FindIdRequest(

	@NotBlank(message = "이름은 필수입니다.")
	String name,

	@NotBlank(message = "이메일은 필수입니다.")
	@Email(message = "올바른 이메일 형식이 아닙니다.")
	String email
) {
}
