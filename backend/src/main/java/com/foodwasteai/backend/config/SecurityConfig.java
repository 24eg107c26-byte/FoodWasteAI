package com.foodwasteai.backend.config;

import com.foodwasteai.backend.security.JwtAuthFilter;
import com.foodwasteai.backend.security.JwtUtil;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // Used to hash passwords and to check them at login.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // One CORS setting for the whole backend.
    // Allows the deployed frontend (FRONTEND_URL) and local development.
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origin}") String allowedOrigin) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
                allowedOrigin.trim(),
                "http://localhost:5173",
                "http://localhost:5174"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Not logged in -> 401 (instead of Spring's default 403)
            .exceptionHandling(e -> e.authenticationEntryPoint(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/error").permitAll()   // keeps 403 as 403 (not 401)
                .requestMatchers("/api/health", "/api/auth/**").permitAll()

                // Admin only
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/food-records").hasRole("ADMIN")

                // Donations
                .requestMatchers(HttpMethod.POST, "/api/donations").hasRole("DONOR")
                .requestMatchers(HttpMethod.GET, "/api/donations/donor/**").hasAnyRole("DONOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/donations/*/claim").hasRole("RECIPIENT")
                .requestMatchers(HttpMethod.POST, "/api/donations/*/complete").hasRole("DONOR")
                .requestMatchers(HttpMethod.GET, "/api/donations/**").hasAnyRole("DONOR", "RECIPIENT", "ADMIN")

                // Food records and AI predictions (donor feature)
                .requestMatchers("/api/food-records/**").hasAnyRole("DONOR", "ADMIN")
                .requestMatchers("/api/predictions/**").hasAnyRole("DONOR", "ADMIN")

                // Dashboard: any logged-in user
                .requestMatchers("/api/dashboard/**").authenticated()

                // Everything else needs login
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}