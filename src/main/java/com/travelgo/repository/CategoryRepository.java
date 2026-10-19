package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findByStatus(ActiveStatus status);
    boolean existsByNameIgnoreCase(String name);
}
