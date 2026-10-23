package com.travelgo.dto.user;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String avatar;
    private Set<String> roles;
    /**
     * Trạng thái tài khoản (ACTIVE/LOCKED).
     * Client trước đây phải suy đoán qua roles.includes('LOCKED') — sai ngữ nghĩa vì
     * LOCKED là user status chứ không phải role.
     */
    private String status;
}