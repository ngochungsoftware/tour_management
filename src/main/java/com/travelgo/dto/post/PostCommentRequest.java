package com.travelgo.dto.post;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostCommentRequest {
    @NotNull
    private Long postId;

    @NotBlank
    @Size(max = 1000)
    private String content;
}
