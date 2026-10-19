package com.travelgo.repository;

import com.travelgo.common.enums.TourStatus;
import com.travelgo.entity.Tour;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourRepository extends JpaRepository<Tour, Long>, JpaSpecificationExecutor<Tour> {

    boolean existsByCode(String code);

    @EntityGraph(attributePaths = {"category", "destination", "images"})
    List<Tour> findTop8ByStatusAndFeaturedTrueOrderByAverageRatingDesc(TourStatus status);

    @EntityGraph(attributePaths = {"category", "destination", "images"})
    List<Tour> findTop8ByStatusOrderByCreatedAtDesc(TourStatus status);

    @EntityGraph(attributePaths = {"category", "destination", "images"})
    List<Tour> findTop8ByStatusOrderByAverageRatingDescReviewCountDesc(TourStatus status);

    @Query("""
            SELECT DISTINCT t FROM Tour t
            JOIN FETCH t.category
            JOIN FETCH t.destination
            LEFT JOIN FETCH t.images
            WHERE t.status = com.travelgo.common.enums.TourStatus.ACTIVE
              AND t.originalPrice IS NOT NULL
              AND t.originalPrice > t.adultPrice
            ORDER BY t.createdAt DESC
            """)
    List<Tour> findDiscountedTours();

    @Query("""
            SELECT t FROM Tour t
            JOIN FETCH t.category
            JOIN FETCH t.destination
            WHERE t.id = :id
            """)
    Optional<Tour> findDetailById(@Param("id") Long id);

    @EntityGraph(attributePaths = {"category", "destination", "images"})
    List<Tour> findTop6ByStatusAndDestinationIdAndIdNot(TourStatus status, Long destinationId, Long id);
}
