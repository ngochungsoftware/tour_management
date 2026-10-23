package com.travelgo.repository;

import com.travelgo.entity.TourAttraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourAttractionRepository extends JpaRepository<TourAttraction, TourAttraction.TourAttractionId> {

    @Query("SELECT ta FROM TourAttraction ta WHERE ta.id.tourId = :tourId ORDER BY ta.visitOrder ASC")
    List<TourAttraction> findByTourId(@Param("tourId") Long tourId);

    @Modifying
    @Query("DELETE FROM TourAttraction ta WHERE ta.id.tourId = :tourId")
    void deleteByTourId(@Param("tourId") Long tourId);
}
