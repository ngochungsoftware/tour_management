package com.travelgo.repository;

import com.travelgo.entity.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    boolean existsByUserIdAndTourId(Long userId, Long tourId);
    Optional<Favorite> findByUserIdAndTourId(Long userId, Long tourId);

    long countByUserId(Long userId);
    @Query("""
            SELECT f FROM Favorite f
            JOIN FETCH f.tour t
            JOIN FETCH t.category
            JOIN FETCH t.destination
            LEFT JOIN FETCH t.images
            WHERE f.user.id = :userId
            ORDER BY f.createdAt DESC
            """)
    List<Favorite> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    void deleteByUserIdAndTourId(Long userId, Long tourId);
}
