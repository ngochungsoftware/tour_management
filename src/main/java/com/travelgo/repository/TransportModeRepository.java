package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.TransportMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TransportModeRepository extends JpaRepository<TransportMode, Long>, JpaSpecificationExecutor<TransportMode> {
    Optional<TransportMode> findByNameIgnoreCase(String name);
    List<TransportMode> findByStatus(ActiveStatus status);
}
