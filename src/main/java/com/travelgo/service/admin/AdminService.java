package com.travelgo.service.admin;

import com.travelgo.common.enums.UserStatus;
import com.travelgo.dto.admin.DashboardResponse;
import com.travelgo.dto.user.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    DashboardResponse dashboard();
    Page<UserResponse> users(String keyword, Pageable pageable);
    UserResponse userDetail(Long id);
    UserResponse changeUserStatus(Long id, UserStatus status);
}
