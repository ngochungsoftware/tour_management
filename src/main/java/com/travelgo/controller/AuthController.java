package com.travelgo.controller;

import com.travelgo.dto.auth.AuthResponse;
import com.travelgo.dto.auth.ChangePasswordRequest;
import com.travelgo.dto.auth.ForgotPasswordRequest;
import com.travelgo.dto.auth.LoginRequest;
import com.travelgo.dto.auth.RegisterRequest;
import com.travelgo.dto.auth.ResetPasswordRequest;
import com.travelgo.dto.user.UpdateProfileRequest;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.service.auth.AuthService;
import com.travelgo.util.ApiResponse;
import com.travelgo.util.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final FileStorageService fileStorageService;

    public AuthController(AuthService authService, FileStorageService fileStorageService) {
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Đăng ký thành công", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Đăng nhập thành công", authService.login(request));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.message("Đăng xuất thành công. Hãy xóa token phía client.");
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> me() {
        return ApiResponse.ok(authService.me());
    }

    @PutMapping("/profile")
    public ApiResponse<UserResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ApiResponse.ok("Cập nhật thành công", authService.updateProfile(request));
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ApiResponse.message("Đổi mật khẩu thành công");
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);
        return ApiResponse.ok("Đã tạo token đặt lại mật khẩu (demo đồ án)", Map.of("resetToken", token));
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.message("Đặt lại mật khẩu thành công");
    }

    @PostMapping("/avatar")
    public ApiResponse<UserResponse> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String url = fileStorageService.storeAvatar(file);
        return ApiResponse.ok("Cập nhật avatar thành công", authService.updateAvatar(url));
    }
}
