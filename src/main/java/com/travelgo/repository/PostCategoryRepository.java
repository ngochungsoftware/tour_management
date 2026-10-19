package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.PostCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostCategoryRepository extends JpaRepository<PostCategory, Long> {

    Optional<PostCategory> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsByName(String name);

    List<PostCategory> findByStatus(ActiveStatus status);

    @Query("""
            SELECT c FROM PostCategory c
            WHERE (:keyword IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    List<PostCategory> search(@Param("keyword") String keyword);
}
