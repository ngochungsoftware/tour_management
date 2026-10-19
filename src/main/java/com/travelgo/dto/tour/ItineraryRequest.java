package com.travelgo.dto.tour;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItineraryRequest {
    @NotNull
    @Min(1)
    private Integer dayNumber;
    @NotBlank
    private String title;
    private String description;
}
