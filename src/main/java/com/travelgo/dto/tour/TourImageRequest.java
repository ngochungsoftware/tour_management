package com.travelgo.dto.tour;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourImageRequest {
    @NotBlank
    private String imageUrl;
    private Boolean cover;
    private Integer sortOrder;
}
