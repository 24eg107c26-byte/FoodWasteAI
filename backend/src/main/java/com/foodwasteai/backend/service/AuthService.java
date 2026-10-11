package com.foodwasteai.backend.service;

import com.foodwasteai.backend.dto.AuthResponse;
import com.foodwasteai.backend.dto.LoginRequest;
import com.foodwasteai.backend.dto.RegisterRequest;
import com.foodwasteai.backend.entity.User;
import com.foodwasteai.backend.repository.UserRepository;
import com.foodwasteai.backend.security.JwtUtil;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        String role = request.role().trim().toUpperCase();

        // Anyone can sign up as DONOR or RECIPIENT. ADMIN is never self-registered.
        if (!role.equals("DONOR") && !role.equals("RECIPIENT")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Role must be DONOR or RECIPIENT");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "An account with this email already exists");
        }

        User user = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password()),   // hashed, never plain text
                role,
                request.phone(),
                request.location()
        );
        User saved = userRepository.save(user);

        return toResponse(saved);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();

        Optional<User> found = userRepository.findByEmail(email);

        // Same message for "no such user" and "wrong password" on purpose.
        if (found.isEmpty()
                || !passwordEncoder.matches(request.password(), found.get().getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        return toResponse(found.get());
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                jwtUtil.generateToken(user),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }
}