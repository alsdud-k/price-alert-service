package com.pricetracker.backend.dto;

/** 비밀번호 찾기 응답 — 임시 비밀번호 반환 */
public record FindPasswordResponse(String temporaryPassword) {
}
