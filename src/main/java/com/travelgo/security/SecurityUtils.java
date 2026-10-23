package com.travelgo.security;

import com.travelgo.entity.User;
import com.travelgo.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.Set;

public final class SecurityUtils {

    /**
     * Các role được coi là "nhân viên nội bộ" — có quyền như admin trong phạm vi
     * nghiệp vụ (duyệt đơn, xem danh sách, trả lời hỏi đáp) nhưng KHÔNG được
     * quản lý danh mục hệ thống hay khóa tài khoản.
     */
    private static final Set<String> STAFF_ROLES = Set.of("ADMIN", "STAFF");

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

    /** Lấy danh sách tên role của user hiện tại (rỗng nếu chưa đăng nhập). */
    public static Set<String> currentRoleNames() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails details)) {
            return Set.of();
        }
        return details.getUser().getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    public static boolean hasRole(String roleName) {
        return currentRoleNames().contains(roleName);
    }

    public static boolean hasAnyRole(String... roleNames) {
        return currentRoleNames().stream().anyMatch(Arrays.asList(roleNames)::contains);
    }

    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /** Nhân viên nội bộ: admin hoặc staff. */
    public static boolean isStaff() {
        return hasAnyRole("ADMIN", "STAFF");
    }
}
