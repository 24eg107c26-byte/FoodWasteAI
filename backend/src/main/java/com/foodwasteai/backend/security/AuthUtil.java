package com.foodwasteai.backend.security;

import org.springframework.security.core.Authentication;

public class AuthUtil {

    // The logged-in user's id, taken from the verified token.
    public static Long userId(Authentication authentication) {
        return (Long) authentication.getPrincipal();
    }

    public static boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}