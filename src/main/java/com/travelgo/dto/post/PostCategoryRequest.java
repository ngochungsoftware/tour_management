package com.travelgo.dto.post;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCategoryRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 100)
    private String slug;

    @Size(max = 500)
    private String description;

    private ActiveStatus status;
}
