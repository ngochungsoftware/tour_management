package com.travelgo.dto.departure;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeparturePointRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String city;
    private String address;
    private ActiveStatus status;
}
