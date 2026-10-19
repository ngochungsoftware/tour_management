package com.travelgo.repository;

import com.travelgo.common.enums.PostStatus;
import com.travelgo.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @EntityGraph(attributePaths = {"author", "category"})
    Page<Post> findByStatus(@Param("status") PostStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query(value = """
            SELECT p FROM Post p
            WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED
            """,
            countQuery = "SELECT COUNT(p) FROM Post p WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED")
    Page<Post> findAllPublished(Pageable pageable);

    /**
     * Lấy top N bài viết nổi bật, sắp xếp theo viewCount DESC.
     * Dùng Pageable với size=limit, sort=viewCount DESC.
     */
    @EntityGraph(attributePaths = {"author", "category"})
    @Query("SELECT p FROM Post p WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED ORDER BY p.viewCount DESC")
    List<Post> findTopFeatured(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query(value = """
            SELECT p FROM Post p
            WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED
              AND p.category.id = :categoryId
            """,
            countQuery = """
            SELECT COUNT(p) FROM Post p
            WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED
              AND p.category.id = :categoryId
            """)
    Page<Post> findPublishedByCategory(@Param("categoryId") Long categoryId, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "category"})
    @Query(value = """
            SELECT p FROM Post p
            WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED
              AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """,
            countQuery = """
            SELECT COUNT(p) FROM Post p
            WHERE p.status = com.travelgo.common.enums.PostStatus.PUBLISHED
              AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<Post> searchPublished(@Param("keyword") String keyword, Pageable pageable);
}
