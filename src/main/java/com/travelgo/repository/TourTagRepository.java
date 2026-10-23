package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.TourTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TourTagRepository extends JpaRepository<TourTag, Long>, JpaSpecificationExecutor<TourTag> {
    Optional<TourTag> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByNameIgnoreCase(String name);
    Optional<TourTag> findByNameIgnoreCase(String name);
    List<TourTag> findByStatus(ActiveStatus status);
}
