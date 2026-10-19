package com.travelgo.security;

import com.travelgo.entity.User;
import com.travelgo.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails details)) {
            throw new UnauthorizedException("Chưa đăng nhập");
        }
        return details.getUser();
    }

    public static Long currentUserId() {
        return currentUser().getId();
    }
}
