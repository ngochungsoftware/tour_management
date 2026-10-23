package com.travelgo.service.auth;

import com.travelgo.common.enums.RoleName;
import com.travelgo.dto.auth.LoginRequest;
import com.travelgo.dto.auth.RegisterRequest;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.entity.Role;
import com.travelgo.entity.User;
import com.travelgo.repository.RoleRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.security.JwtService;
import com.travelgo.service.UserMapper;
import com.travelgo.service.auth.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private UserMapper userMapper;
    @InjectMocks private AuthServiceImpl authService;

    @Test
    void registerSuccess() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Nguyen Van A");
        request.setEmail("a@gmail.com");
        request.setPassword("123456");
        when(userRepository.existsByEmail("a@gmail.com")).thenReturn(false);
        when(roleRepository.findByName(RoleName.CUSTOMER)).thenReturn(Optional.of(Role.builder().name(RoleName.CUSTOMER).build()));
        when(passwordEncoder.encode("123456")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtService.generateToken(any(), any())).thenReturn("jwt-token");
        when(userMapper.toResponse(any())).thenReturn(UserResponse.builder().email("a@gmail.com").build());

        var result = authService.register(request);

        assertThat(result.getToken()).isEqualTo("jwt-token");
        assertThat(result.getUser().getEmail()).isEqualTo("a@gmail.com");
    }

    @Test
    void registerDuplicateEmail() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("a@gmail.com");
        when(userRepository.existsByEmail("a@gmail.com")).thenReturn(true);
        assertThatThrownBy(() -> authService.register(request))
                .hasMessageContaining("Email đã được sử dụng");
    }

    @Test
    void loginSuccess() {
        LoginRequest request = new LoginRequest();
        request.setEmail("a@gmail.com");
        request.setPassword("123456");
        User user = User.builder().email("a@gmail.com").roles(Set.of(Role.builder().name(RoleName.CUSTOMER).build())).build();
        when(userRepository.findByEmail("a@gmail.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(), any())).thenReturn("jwt-token");
        when(userMapper.toResponse(user)).thenReturn(UserResponse.builder().email("a@gmail.com").build());

        var result = authService.login(request);
        assertThat(result.getToken()).isEqualTo("jwt-token");
    }
}
