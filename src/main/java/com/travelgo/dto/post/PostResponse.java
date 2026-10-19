package com.travelgo.dto.post;

import com.travelgo.common.enums.PostStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PostResponse {
    private Long id;
    private String title;
    private String slug;
    private String excerpt;
    private String thumbnail;
    private Long authorId;
    private String authorName;
    private Long categoryId;
    private String categoryName;
    private PostStatus status;
    private Integer viewCount;
    private Boolean featured;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long commentCount;
    private List<PostCommentResponse> comments;
}
