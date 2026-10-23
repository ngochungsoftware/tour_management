package com.travelgo.repository;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.entity.TourQa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TourQaRepository extends JpaRepository<TourQa, Long>,
                                           JpaSpecificationExecutor<TourQa> {

    @EntityGraph(attributePaths = {"user", "tour"})
    @Query(value = """
            SELECT q FROM TourQa q
            WHERE q.tour.id = :tourId
              AND q.status = :status
            """,
            countQuery = """
            SELECT COUNT(q) FROM TourQa q
            WHERE q.tour.id = :tourId
              AND q.status = :status
            """)
    Page<TourQa> findByTourIdAndStatus(@Param("tourId") Long tourId,
                                       @Param("status") ActiveStatus status,
                                       Pageable pageable);

    @EntityGraph(attributePaths = {"user", "tour"})
    @Query(value = """
            SELECT q FROM TourQa q
            WHERE q.status = :status
            """,
            countQuery = """
            SELECT COUNT(q) FROM TourQa q
            WHERE q.status = :status
            """)
    Page<TourQa> findAllByStatus(@Param("status") ActiveStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"tour"})
    List<TourQa> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT q FROM TourQa q WHERE q.user.id = :userId ORDER BY q.createdAt DESC")
    List<TourQa> findByUserId(@Param("userId") Long userId);

    long countByStatus(ActiveStatus status);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ActiveStatus status);

    /**
     * Top N câu hỏi được đánh dấu có câu trả lời hay + nhiều reply.
     * Dùng cho FAQ / "Câu hỏi hay nhất".
     * Dùng EntityGraph thay vì JOIN FETCH để tránh warning in-memory paging.
     */
    @EntityGraph(attributePaths = {"tour"})
    @Query("""
            SELECT q FROM TourQa q
            WHERE q.status = com.travelgo.common.enums.ActiveStatus.ACTIVE
              AND q.replyCount > 0
              AND EXISTS (SELECT 1 FROM QaReply r
                          WHERE r.qa = q AND r.isAnswer = true AND r.status = com.travelgo.common.enums.ActiveStatus.ACTIVE)
            ORDER BY q.replyCount DESC, q.createdAt DESC
            """)
    List<TourQa> findFaq(Pageable pageable);
}
