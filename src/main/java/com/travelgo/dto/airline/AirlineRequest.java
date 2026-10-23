package com.travelgo.dto.airline;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AirlineRequest {
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    private String logo;
    private ActiveStatus status;
}
