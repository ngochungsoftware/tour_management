package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    @Query("""
            SELECT c FROM PostComment c
            JOIN FETCH c.user
            WHERE c.post.id = :postId
              AND c.status = :status
            ORDER BY c.createdAt DESC
            """)
    List<PostComment> findByPostIdAndStatus(@Param("postId") Long postId, @Param("status") ActiveStatus status);

    long countByPostIdAndStatus(Long postId, ActiveStatus status);

    long countByUserId(Long userId);
}
