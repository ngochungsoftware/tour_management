package com.travelgo.dto.post;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostCategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private ActiveStatus status;
    private LocalDateTime createdAt;
}
