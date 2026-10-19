package com.travelgo.service.auth;

import com.travelgo.dto.auth.AuthResponse;
import com.travelgo.dto.auth.ChangePasswordRequest;
import com.travelgo.dto.auth.ForgotPasswordRequest;
import com.travelgo.dto.auth.LoginRequest;
import com.travelgo.dto.auth.RegisterRequest;
import com.travelgo.dto.auth.ResetPasswordRequest;
import com.travelgo.dto.user.UpdateProfileRequest;
import com.travelgo.dto.user.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse me();
    UserResponse updateProfile(UpdateProfileRequest request);
    void changePassword(ChangePasswordRequest request);
    String forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserResponse updateAvatar(String avatarUrl);
}
