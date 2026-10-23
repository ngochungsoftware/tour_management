package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.BannerPosition;
import com.travelgo.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long>, JpaSpecificationExecutor<Banner> {

    @Query("SELECT b FROM Banner b WHERE b.status = :status " +
            "AND (b.startDate IS NULL OR b.startDate <= :now) " +
            "AND (b.endDate IS NULL OR b.endDate >= :now) " +
            "ORDER BY b.sortOrder ASC")
    List<Banner> findActive(@Param("status") ActiveStatus status, @Param("now") LocalDateTime now);

    List<Banner> findByPositionAndStatusOrderBySortOrderAsc(BannerPosition position, ActiveStatus status);
}
