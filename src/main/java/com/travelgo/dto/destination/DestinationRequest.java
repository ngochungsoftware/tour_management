package com.travelgo.dto.destination;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DestinationRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String province;
    private String description;
    private String image;
    private ActiveStatus status;
}
