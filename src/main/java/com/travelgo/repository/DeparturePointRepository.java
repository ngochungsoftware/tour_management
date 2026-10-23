package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.DeparturePoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface DeparturePointRepository extends JpaRepository<DeparturePoint, Long>, JpaSpecificationExecutor<DeparturePoint> {
    Optional<DeparturePoint> findByNameIgnoreCase(String name);
    List<DeparturePoint> findByStatus(ActiveStatus status);
    List<DeparturePoint> findByCityIgnoreCase(String city);
}
