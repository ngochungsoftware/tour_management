package com.travelgo.repository;

import com.travelgo.entity.TourSchedule;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {

    @EntityGraph(attributePaths = {"tour", "transportMode", "departurePoint", "airline"})
    List<TourSchedule> findByTourIdOrderByDepartureDateAsc(Long tourId);

    @EntityGraph(attributePaths = {"tour", "transportMode", "departurePoint", "airline"})
    List<TourSchedule> findAllByOrderByDepartureDateAsc();

    @Override
    @EntityGraph(attributePaths = {"tour", "transportMode", "departurePoint", "airline"})
    Optional<TourSchedule> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TourSchedule s WHERE s.id = :id")
    Optional<TourSchedule> findByIdForUpdate(@Param("id") Long id);
}