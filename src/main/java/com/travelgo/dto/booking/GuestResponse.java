package com.travelgo.dto.booking;

import com.travelgo.common.enums.Gender;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
public class GuestResponse {
    private Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String phone;
    private String email;
    private String identityNumber;
}
