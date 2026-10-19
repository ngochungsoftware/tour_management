package com.travelgo.service.category.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.category.CategoryRequest;
import com.travelgo.dto.category.CategoryResponse;
import com.travelgo.entity.Category;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.CategoryRepository;
import com.travelgo.service.category.CategoryService;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<CategoryResponse> findActive() {
        return categoryRepository.findByStatus(ActiveStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Page<CategoryResponse> search(String keyword, Pageable pageable) {
        Specification<Category> spec = (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(cb.like(cb.lower(root.get("name")), like));
        };
        return categoryRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public CategoryResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Danh mục đã tồn tại");
        }
        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = find(id);
        categoryRepository.findByNameIgnoreCase(request.getName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("Danh mục đã tồn tại");
                });
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }
        return toResponse(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        categoryRepository.delete(find(id));
    }

    @Override
    public Category find(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Danh mục không tồn tại"));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .status(category.getStatus())
                .build();
    }
}
