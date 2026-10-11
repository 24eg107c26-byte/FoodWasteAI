package com.foodwasteai.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email") String email,
        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 72, message = "Password must be 6 to 72 characters") String password,
        @NotBlank(message = "Role is required") String role,
        String phone,
        String location
) {
}