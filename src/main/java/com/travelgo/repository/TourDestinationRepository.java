package com.travelgo.repository;

import com.travelgo.entity.TourDestination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourDestinationRepository extends JpaRepository<TourDestination, TourDestination.TourDestinationId> {

    @Query("SELECT td FROM TourDestination td WHERE td.id.tourId = :tourId ORDER BY td.sortOrder ASC")
    List<TourDestination> findByTourId(@Param("tourId") Long tourId);

    @Modifying
    @Query("DELETE FROM TourDestination td WHERE td.id.tourId = :tourId")
    void deleteByTourId(@Param("tourId") Long tourId);
}
