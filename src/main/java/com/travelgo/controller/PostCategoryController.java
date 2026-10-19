package com.travelgo.controller;

import com.travelgo.dto.post.PostCategoryRequest;
import com.travelgo.dto.post.PostCategoryResponse;
import com.travelgo.service.post.PostCategoryService;
import com.travelgo.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/post-categories")
public class PostCategoryController {

    private final PostCategoryService postCategoryService;

    public PostCategoryController(PostCategoryService postCategoryService) {
        this.postCategoryService = postCategoryService;
    }

    @GetMapping
    public ApiResponse<List<PostCategoryResponse>> list(
            @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(postCategoryService.search(keyword));
    }

    @GetMapping("/active")
    public ApiResponse<List<PostCategoryResponse>> active() {
        return ApiResponse.ok(postCategoryService.findActive());
    }

    @GetMapping("/{id}")
    public ApiResponse<PostCategoryResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(postCategoryService.get(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostCategoryResponse> create(@Valid @RequestBody PostCategoryRequest request) {
        return ApiResponse.ok("Tạo danh mục bài viết thành công", postCategoryService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<PostCategoryResponse> update(@PathVariable Long id,
                                                    @Valid @RequestBody PostCategoryRequest request) {
        return ApiResponse.ok("Cập nhật danh mục bài viết thành công",
                postCategoryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        postCategoryService.delete(id);
        return ApiResponse.message("Đã xóa danh mục bài viết");
    }
}
