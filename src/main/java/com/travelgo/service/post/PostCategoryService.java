package com.travelgo.service.post;

import com.travelgo.dto.post.PostCategoryRequest;
import com.travelgo.dto.post.PostCategoryResponse;
import com.travelgo.entity.PostCategory;

import java.util.List;

public interface PostCategoryService {
    List<PostCategoryResponse> findAll();
    List<PostCategoryResponse> findActive();
    List<PostCategoryResponse> search(String keyword);
    PostCategoryResponse get(Long id);
    PostCategoryResponse create(PostCategoryRequest request);
    PostCategoryResponse update(Long id, PostCategoryRequest request);
    void delete(Long id);
    PostCategory find(Long id);
}
