package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.Airline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface AirlineRepository extends JpaRepository<Airline, Long>, JpaSpecificationExecutor<Airline> {
    Optional<Airline> findByCodeIgnoreCase(String code);
    Optional<Airline> findByNameIgnoreCase(String name);
    List<Airline> findByStatus(ActiveStatus status);
}
