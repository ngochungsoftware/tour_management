package com.travelgo.repository;

import com.travelgo.entity.TourTagMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourTagMapRepository extends JpaRepository<TourTagMap, TourTagMap.TourTagMapId> {

    @Query("SELECT ttm FROM TourTagMap ttm WHERE ttm.id.tourId = :tourId")
    List<TourTagMap> findByTourId(@Param("tourId") Long tourId);

    @Query("SELECT ttm FROM TourTagMap ttm WHERE ttm.id.tagId = :tagId")
    List<TourTagMap> findByTagId(@Param("tagId") Long tagId);

    @Modifying
    @Query("DELETE FROM TourTagMap ttm WHERE ttm.id.tourId = :tourId")
    void deleteByTourId(@Param("tourId") Long tourId);

    @Modifying
    @Query("DELETE FROM TourTagMap ttm WHERE ttm.id.tagId = :tagId")
    void deleteByTagId(@Param("tagId") Long tagId);
}
