package com.travelgo.controller;

import com.travelgo.common.enums.PostStatus;
import com.travelgo.dto.post.PostRequest;
import com.travelgo.dto.post.PostResponse;
import com.travelgo.service.post.PostService;
import com.travelgo.util.ApiResponse;
import com.travelgo.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ApiResponse<PageResponse<PostResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @PageableDefault(size = 10, sort = "publishedAt") Pageable pageable) {
        return ApiResponse.ok(postService.searchPublished(keyword, categoryId, pageable));
    }

    @GetMapping("/featured")
    public ApiResponse<java.util.List<PostResponse>> featured(
            @RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.ok(postService.getTopFeatured(limit));
    }

    @GetMapping("/{id}")
    public ApiResponse<PostResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(postService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    public ApiResponse<PostResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.ok(postService.getBySlug(slug));
    }

    @GetMapping("/{id}/related")
    public ApiResponse<java.util.List<PostResponse>> related(
            @PathVariable Long id,
            @RequestParam(defaultValue = "4") int limit) {
        return ApiResponse.ok(postService.getRelated(id, limit));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> create(@Valid @RequestBody PostRequest request) {
        return ApiResponse.ok("Tạo bài viết thành công", postService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PostResponse> update(@PathVariable Long id,
                                            @Valid @RequestBody PostRequest request) {
        return ApiResponse.ok("Cập nhật bài viết thành công", postService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        postService.delete(id);
        return ApiResponse.message("Đã xóa bài viết");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<PostResponse> changeStatus(@PathVariable Long id,
                                                  @RequestParam PostStatus status) {
        return ApiResponse.ok("Đã đổi trạng thái bài viết", postService.changeStatus(id, status));
    }
}
