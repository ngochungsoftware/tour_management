package com.travelgo.dto.tourqa;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QaReplyRequest {
    @NotNull
    private Long qaId;

    @NotBlank
    @Size(max = 2000)
    private String reply;
}
