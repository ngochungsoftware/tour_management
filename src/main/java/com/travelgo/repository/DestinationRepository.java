package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface DestinationRepository extends JpaRepository<Destination, Long>, JpaSpecificationExecutor<Destination> {
    boolean existsByNameIgnoreCase(String name);
    List<Destination> findByStatus(ActiveStatus status);
}
