package com.travelgo.dto.user;

import com.travelgo.common.enums.Gender;
import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

/**
 * Cập nhật tài khoản nhân viên.
 * Mật khẩu là tùy chọn: để trống nghĩa là giữ nguyên mật khẩu hiện tại.
 */
@Getter
@Setter
public class UserUpdateRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    private String phone;
    private Gender gender;
    private String address;
    private UserStatus status;
    private Set<RoleName> roles;

    /** Đặt lại mật khẩu — chỉ khi admin gửi giá trị mới. */
    @Size(min = 6, message = "mật khẩu phải có ít nhất 6 ký tự")
    private String password;
}