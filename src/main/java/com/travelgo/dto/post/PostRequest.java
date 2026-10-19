package com.travelgo.dto.post;

import com.travelgo.common.enums.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostRequest {
    @NotBlank
    @Size(max = 255)
    private String title;

    @NotBlank
    @Size(max = 255)
    private String slug;

    @Size(max = 500)
    private String excerpt;

    @NotBlank
    private String content;

    @Size(max = 500)
    private String thumbnail;

    @NotNull
    private Long categoryId;

    private PostStatus status;
    private Boolean featured;
}
