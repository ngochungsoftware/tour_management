package com.travelgo.dto.transport;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransportModeRequest {
    @NotBlank
    private String name;
    private String description;
    private String icon;
    private ActiveStatus status;
}
