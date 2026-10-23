package com.travelgo.dto.tourtag;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourTagRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String slug;
    private ActiveStatus status;
}
