package com.travelgo.service.post;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.post.PostCommentRequest;
import com.travelgo.dto.post.PostCommentResponse;

import java.util.List;

public interface PostCommentService {
    List<PostCommentResponse> getVisibleComments(Long postId);
    List<PostCommentResponse> getAllCommentsByPost(Long postId);
    PostCommentResponse create(PostCommentRequest request);
    void delete(Long id);
    PostCommentResponse changeStatus(Long id, ActiveStatus status);
}
