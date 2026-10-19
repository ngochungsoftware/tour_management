package com.travelgo.service.post;

import com.travelgo.common.enums.PostStatus;
import com.travelgo.dto.post.PostCommentResponse;
import com.travelgo.dto.post.PostRequest;
import com.travelgo.dto.post.PostResponse;
import com.travelgo.entity.Post;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    PageResponse<PostResponse> searchPublished(String keyword, Long categoryId, Pageable pageable);
    PostResponse getById(Long id);
    PostResponse getBySlug(String slug);
    PostResponse incrementView(Long id);
    List<PostResponse> getTopFeatured(int limit);
    List<PostResponse> getRelated(Long postId, int limit);
    PostResponse create(PostRequest request);
    PostResponse update(Long id, PostRequest request);
    void delete(Long id);
    PostResponse changeStatus(Long id, PostStatus status);
    PostResponse toResponse(Post post, boolean includeContent, boolean includeComments);
    PostCommentResponse toCommentResponse(com.travelgo.entity.PostComment comment);
}
