package com.travelgo.service.post.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.PostStatus;
import com.travelgo.dto.post.PostCommentRequest;
import com.travelgo.dto.post.PostCommentResponse;
import com.travelgo.entity.Post;
import com.travelgo.entity.PostComment;
import com.travelgo.entity.User;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.PostCommentRepository;
import com.travelgo.repository.PostRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.post.PostCommentService;
import com.travelgo.service.post.PostService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostCommentServiceImpl implements PostCommentService {

    private final PostCommentRepository postCommentRepository;
    private final PostRepository postRepository;
    private final PostService postService;

    public PostCommentServiceImpl(PostCommentRepository postCommentRepository,
                                  PostRepository postRepository,
                                  PostService postService) {
        this.postCommentRepository = postCommentRepository;
        this.postRepository = postRepository;
        this.postService = postService;
    }

    @Override
    public List<PostCommentResponse> getVisibleComments(Long postId) {
        return postCommentRepository.findByPostIdAndStatus(postId, ActiveStatus.ACTIVE).stream()
                .map(postService::toCommentResponse)
                .toList();
    }

    @Override
    public List<PostCommentResponse> getAllCommentsByPost(Long postId) {
        return postCommentRepository.findByPostIdAndStatus(postId, ActiveStatus.ACTIVE).stream()
                .map(postService::toCommentResponse)
                .toList();
    }

    @Override
    @Transactional
    public PostCommentResponse create(PostCommentRequest request) {
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new BadRequestException("Không thể bình luận bài viết chưa xuất bản");
        }
        User user = SecurityUtils.currentUser();
        PostComment comment = PostComment.builder()
                .post(post)
                .user(user)
                .content(request.getContent())
                .status(ActiveStatus.ACTIVE)
                .build();
        return postService.toCommentResponse(postCommentRepository.save(comment));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        postCommentRepository.delete(find(id));
    }

    @Override
    @Transactional
    public PostCommentResponse changeStatus(Long id, ActiveStatus status) {
        PostComment comment = find(id);
        comment.setStatus(status);
        return postService.toCommentResponse(comment);
    }

    private PostComment find(Long id) {
        return postCommentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bình luận không tồn tại"));
    }
}
