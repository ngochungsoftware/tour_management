package com.travelgo.controller;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.post.PostCommentRequest;
import com.travelgo.dto.post.PostCommentResponse;
import com.travelgo.service.post.PostCommentService;
import com.travelgo.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/post-comments")
public class PostCommentController {

    private final PostCommentService postCommentService;

    public PostCommentController(PostCommentService postCommentService) {
        this.postCommentService = postCommentService;
    }

    @GetMapping("/post/{postId}")
    public ApiResponse<List<PostCommentResponse>> byPost(@PathVariable Long postId) {
        return ApiResponse.ok(postCommentService.getVisibleComments(postId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostCommentResponse> create(@Valid @RequestBody PostCommentRequest request) {
        return ApiResponse.ok("Bình luận thành công", postCommentService.create(request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        postCommentService.delete(id);
        return ApiResponse.message("Đã xóa bình luận");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<PostCommentResponse> changeStatus(@PathVariable Long id,
                                                         @RequestParam ActiveStatus status) {
        return ApiResponse.ok("Đã cập nhật trạng thái bình luận",
                postCommentService.changeStatus(id, status));
    }
}
