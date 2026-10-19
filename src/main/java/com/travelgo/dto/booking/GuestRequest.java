package com.travelgo.dto.booking;

import com.travelgo.common.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class GuestRequest {
    @NotBlank
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String phone;
    private String email;
    private String identityNumber;
}
