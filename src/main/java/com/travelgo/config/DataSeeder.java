package com.travelgo.config;

import com.travelgo.common.enums.Gender;
import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.UserStatus;
import com.travelgo.entity.Role;
import com.travelgo.entity.User;
import com.travelgo.repository.RoleRepository;
import com.travelgo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

/**
 * Tự động tạo user mẫu khi app start (nếu app.seed.enabled=true trong application.yml).
 * - ADMIN:   admin@travelgo.com   / Admin@123
 * - CUSTOMER: customer@travelgo.com / Customer@123
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("DataSeeder: app.seed.enabled=false => skip");
            return;
        }

        log.info("DataSeeder: starting...");

        // 1. Đảm bảo roles tồn tại
        Role adminRole = ensureRole(RoleName.ADMIN);
        Role customerRole = ensureRole(RoleName.CUSTOMER);

        // 2. Seed user admin
        seedUserIfMissing(
                "admin@travelgo.com",
                "Administrator",
                "Admin@123",
                Gender.MALE,
                "0900000001",
                "Hà Nội",
                UserStatus.ACTIVE,
                Set.of(adminRole)
        );

        // 3. Seed user customer
        seedUserIfMissing(
                "customer@travelgo.com",
                "Khách hàng demo",
                "Customer@123",
                Gender.FEMALE,
                "0900000002",
                "TP. Hồ Chí Minh",
                UserStatus.ACTIVE,
                Set.of(customerRole)
        );

        log.info("DataSeeder: done. Users: admin@travelgo.com / Admin@123, customer@travelgo.com / Customer@123");
    }

    private Role ensureRole(RoleName name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role r = Role.builder().name(name).build();
                    return roleRepository.save(r);
                });
    }

    private void seedUserIfMissing(String email,
                                   String fullName,
                                   String rawPassword,
                                   Gender gender,
                                   String phone,
                                   String address,
                                   UserStatus status,
                                   Set<Role> roles) {
        if (userRepository.existsByEmail(email)) {
            log.info("DataSeeder: user {} already exists => skip", email);
            return;
        }
        User u = User.builder()
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(rawPassword))
                .gender(gender)
                .phone(phone)
                .address(address)
                .status(status)
                .roles(new HashSet<>(roles))
                .build();
        userRepository.save(u);
        log.info("DataSeeder: created user {}", email);
    }
}
