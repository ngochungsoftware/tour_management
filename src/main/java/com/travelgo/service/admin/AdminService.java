package com.travelgo.service.admin;

import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.UserStatus;
import com.travelgo.dto.admin.DashboardResponse;
import com.travelgo.dto.user.UserCreateRequest;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.dto.user.UserUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;

public interface AdminService {
    DashboardResponse dashboard();

    /**
     * Danh sách tài khoản theo nhóm vai trò.
     *
     * @param roles các role được chấp nhận; null/rỗng = không lọc theo role.
     *              Màn nhân viên truyền {ADMIN, STAFF}, màn khách hàng truyền {CUSTOMER}.
     */
    Page<UserResponse> users(String keyword, Set<RoleName> roles, UserStatus status, Pageable pageable);

    UserResponse userDetail(Long id);

    UserResponse changeUserStatus(Long id, UserStatus status);

    UserResponse createUser(UserCreateRequest request, Set<RoleName> allowedRoles);

    UserResponse updateUser(Long id, UserUpdateRequest request, Set<RoleName> allowedRoles);

    void deleteUser(Long id);
}