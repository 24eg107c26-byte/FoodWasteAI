package com.foodwasteai.backend.dto;

public record AuthResponse(
        String token,
        Long id,
        String name,
        String email,
        String role
) {
}