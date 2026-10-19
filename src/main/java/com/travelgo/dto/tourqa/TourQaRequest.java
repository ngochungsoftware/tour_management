package com.travelgo.dto.tourqa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TourQaRequest {
    @NotNull
    private Long tourId;

    @NotBlank
    @Size(max = 1000)
    private String question;
}
