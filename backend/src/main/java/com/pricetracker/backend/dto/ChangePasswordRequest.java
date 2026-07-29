package com.pricetracker.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 비밀번호 변경 요청 */
public record ChangePasswordRequest(

	@NotBlank(message = "현재 비밀번호는 필수입니다.")
	String currentPassword,

	@NotBlank(message = "새 비밀번호는 필수입니다.")
	@Size(min = 8, max = 100, message = "비밀번호는 8자 이상 100자 이하여야 합니다.")
	String newPassword
) {
}
