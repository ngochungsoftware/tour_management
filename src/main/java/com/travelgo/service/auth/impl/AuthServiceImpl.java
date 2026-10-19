package com.travelgo.service.auth.impl;

import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.UserStatus;
import com.travelgo.dto.auth.AuthResponse;
import com.travelgo.dto.auth.ChangePasswordRequest;
import com.travelgo.dto.auth.ForgotPasswordRequest;
import com.travelgo.dto.auth.LoginRequest;
import com.travelgo.dto.auth.RegisterRequest;
import com.travelgo.dto.auth.ResetPasswordRequest;
import com.travelgo.dto.user.UpdateProfileRequest;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.entity.Role;
import com.travelgo.entity.User;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.RoleRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.security.JwtService;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.UserMapper;
import com.travelgo.service.auth.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           AuthenticationManager authenticationManager,
                           JwtService jwtService,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng");
        }
        Role customerRole = roleRepository.findByName(RoleName.CUSTOMER)
                .orElseThrow(() -> new ResourceNotFoundException("Role CUSTOMER chưa được khởi tạo"));

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .address(request.getAddress())
                .status(UserStatus.ACTIVE)
                .roles(Set.of(customerRole))
                .build();
        userRepository.save(user);
        return buildAuth(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        user.getRoles().size();
        return buildAuth(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse me() {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        user.getRoles().size();
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setDateOfBirth(request.getDateOfBirth());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        user.getRoles().size();
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    }

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại"));
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        return token;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Token không hợp lệ"));
        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token đã hết hạn");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
    }

    @Override
    @Transactional
    public UserResponse updateAvatar(String avatarUrl) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
        user.setAvatar(avatarUrl);
        user.getRoles().size();
        return userMapper.toResponse(user);
    }

    private AuthResponse buildAuth(User user) {
        String role = user.getRoles().stream()
                .findFirst()
                .map(r -> r.getName().name())
                .orElse(RoleName.CUSTOMER.name());
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getEmail(), role))
                .tokenType("Bearer")
                .user(userMapper.toResponse(user))
                .build();
    }
}
