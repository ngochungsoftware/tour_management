package com.travelgo.repository;

import com.travelgo.entity.TourSchedule;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TourScheduleRepository extends JpaRepository<TourSchedule, Long> {

    List<TourSchedule> findByTourIdOrderByDepartureDateAsc(Long tourId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM TourSchedule s WHERE s.id = :id")
    Optional<TourSchedule> findByIdForUpdate(@Param("id") Long id);
}
