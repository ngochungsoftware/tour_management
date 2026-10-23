package com.travelgo.config;

import com.travelgo.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/v1/auth/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**",
                                "/uploads/**"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/v1/tours/**",
                                "/api/v1/categories/**",
                                "/api/v1/destinations/**",
                                "/api/v1/attractions/**",
                                "/api/v1/tour-tags/**",
                                "/api/v1/departure-points/**",
                                "/api/v1/transport-modes/**",
                                "/api/v1/airlines/**",
                                "/api/v1/banners/**",
                                "/api/v1/home/**",
                                "/api/v1/reviews/tour/**",
                                "/api/v1/posts/**",
                                "/api/v1/post-categories/**",
                                "/api/v1/post-comments/post/**",
                                "/api/v1/tour-qa/**",
                                "/api/v1/schedules/**"
                        ).permitAll()
                        // Nhân viên chỉ được DUYỆT vận hành (đơn, tour, hỏi đáp, đánh giá...).
                        // Các thao tác phá hủy dữ liệu hệ thống / quản lý tài khoản vẫn chỉ ADMIN.
                        //
                        // THỨ TỰ RẤT QUAN TRỌNG: các rule hẹp (ADMIN-only) phải nằm TRƯỚC
                        // rule rộng "/api/v1/admin/**". Spring Security dừng ở rule khớp đầu
                        // tiên, nên nếu để rule rộng trước thì các rule hẹp bên dưới sẽ
                        // không bao giờ được áp dụng.
                        .requestMatchers(
                                "/api/v1/admin/users/**",
                                "/api/v1/admin/staff/**",
                                "/api/v1/admin/customers/**",
                                "/api/v1/admin/categories/**",
                                "/api/v1/admin/destinations/**",
                                "/api/v1/admin/attractions/**",
                                "/api/v1/admin/tour-tags/**",
                                "/api/v1/admin/departure-points/**",
                                "/api/v1/admin/transport-modes/**",
                                "/api/v1/admin/airlines/**",
                                "/api/v1/admin/banners/**",
                                "/api/v1/admin/coupons/**",
                                "/api/v1/admin/posts/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/**").hasRole("ADMIN")
                        // Rule rộng nhất — ĐỂ CUỐI CÙNG, sau tất cả rule hẹp ở trên.
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // Cho phép cả dev (3000) lẫn prod và Swagger
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
