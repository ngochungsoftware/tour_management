package com.travelgo.service.category;

import com.travelgo.dto.category.CategoryRequest;
import com.travelgo.dto.category.CategoryResponse;
import com.travelgo.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> findActive();
    Page<CategoryResponse> search(String keyword, Pageable pageable);
    CategoryResponse get(Long id);
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    void delete(Long id);
    Category find(Long id);
}
