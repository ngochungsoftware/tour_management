package com.travelgo.dto.post;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostCommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userName;
    private String content;
    private ActiveStatus status;
    private LocalDateTime createdAt;
}
