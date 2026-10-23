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
 * Tạo tài khoản nhân viên từ trang quản trị.
 * Mật khẩu bắt buộc vì admin tạo hộ, không có luồng "tự đặt mật khẩu lần đầu".
 */
@Getter
@Setter
public class UserCreateRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, message = "mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    private String phone;
    private Gender gender;
    private String address;

    private UserStatus status;

    /** Chỉ nhận ADMIN/STAFF — CUSTOMER không thuộc phạm vi màn nhân viên. */
    private Set<RoleName> roles;
}