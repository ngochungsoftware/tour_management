package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.Attraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AttractionRepository extends JpaRepository<Attraction, Long>, JpaSpecificationExecutor<Attraction> {
    List<Attraction> findByDestination_Id(Long destinationId);
    List<Attraction> findByStatus(ActiveStatus status);

    // Nạp kèm Destination trong cùng 1 truy vấn để toResponse() không bị
    // LazyInitializationException khi đọc ngoài transaction.
    @Query("select a from Attraction a join fetch a.destination where a.id = :id")
    Optional<Attraction> findByIdWithDestination(@Param("id") Long id);

    @Query("select a from Attraction a join fetch a.destination where a.status = :status")
    List<Attraction> findByStatusWithDestination(@Param("status") ActiveStatus status);

    @Query("select a from Attraction a join fetch a.destination where a.destination.id = :destinationId")
    List<Attraction> findByDestinationIdWithDestination(@Param("destinationId") Long destinationId);
}
