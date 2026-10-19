package com.travelgo.service.post.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.post.PostCategoryRequest;
import com.travelgo.dto.post.PostCategoryResponse;
import com.travelgo.entity.PostCategory;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.PostCategoryRepository;
import com.travelgo.service.post.PostCategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PostCategoryServiceImpl implements PostCategoryService {

    private final PostCategoryRepository postCategoryRepository;

    public PostCategoryServiceImpl(PostCategoryRepository postCategoryRepository) {
        this.postCategoryRepository = postCategoryRepository;
    }

    @Override
    public List<PostCategoryResponse> findAll() {
        return postCategoryRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PostCategoryResponse> findActive() {
        return postCategoryRepository.findByStatus(ActiveStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<PostCategoryResponse> search(String keyword) {
        return postCategoryRepository.search(keyword).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public PostCategoryResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public PostCategoryResponse create(PostCategoryRequest request) {
        if (postCategoryRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug danh mục đã tồn tại");
        }
        if (postCategoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }
        PostCategory category = PostCategory.builder()
                .name(request.getName())
                .slug(request.getSlug().toLowerCase())
                .description(request.getDescription())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(postCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public PostCategoryResponse update(Long id, PostCategoryRequest request) {
        PostCategory category = find(id);
        postCategoryRepository.findBySlug(request.getSlug())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("Slug danh mục đã tồn tại");
                });
        category.setName(request.getName());
        category.setSlug(request.getSlug().toLowerCase());
        category.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }
        return toResponse(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        postCategoryRepository.delete(find(id));
    }

    @Override
    public PostCategory find(Long id) {
        return postCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục bài viết không tồn tại"));
    }

    private PostCategoryResponse toResponse(PostCategory category) {
        return PostCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .status(category.getStatus())
                .createdAt(category.getCreatedAt())
                .build();
    }
}
