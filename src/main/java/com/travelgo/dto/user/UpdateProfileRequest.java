package com.travelgo.dto.user;

import com.travelgo.common.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateProfileRequest {
    @NotBlank
    private String fullName;
    private String phone;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String address;
}
