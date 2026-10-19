package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.QaReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QaReplyRepository extends JpaRepository<QaReply, Long> {

    @Query("""
            SELECT r FROM QaReply r
            JOIN FETCH r.user
            WHERE r.qa.id = :qaId
              AND r.status = :status
            ORDER BY r.isAnswer DESC, r.createdAt ASC
            """)
    List<QaReply> findByQaIdAndStatus(@Param("qaId") Long qaId,
                                      @Param("status") ActiveStatus status);

    long countByQaIdAndStatus(Long qaId, ActiveStatus status);
}
