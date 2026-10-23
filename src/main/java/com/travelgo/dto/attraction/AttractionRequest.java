package com.travelgo.dto.attraction;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttractionRequest {
    @NotBlank
    private String name;
    @NotNull
    private Long destinationId;
    private String description;
    private String image;
    private String address;
    private ActiveStatus status;
}
