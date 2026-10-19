package com.travelgo.repository.spec;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.tourqa.TourQaSearchFilter;
import com.travelgo.entity.TourQa;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specification cho TourQa - hỗ trợ filter động.
 * Mỗi method trả về một Specification có thể kết hợp với nhau bằng .and() / .or().
 */
public final class TourQaSpecification {

    private TourQaSpecification() {
    }

    public static Specification<TourQa> buildFilter(TourQaSearchFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Keyword - tìm trong question (LIKE, case-insensitive)
            if (filter.getKeyword() != null && !filter.getKeyword().isBlank()) {
                String pattern = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                predicates.add(
                        cb.or(
                                cb.like(cb.lower(root.get("question")), pattern)
                        )
                );
            }

            // 2. Filter theo tour
            if (filter.getTourId() != null) {
                predicates.add(cb.equal(root.get("tour").get("id"), filter.getTourId()));
            }

            // 3. Filter theo user
            if (filter.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), filter.getUserId()));
            }

            // 4. Status (mặc định ACTIVE)
            ActiveStatus status = filter.getStatus() != null ? filter.getStatus() : ActiveStatus.ACTIVE;
            predicates.add(cb.equal(root.get("status"), status));

            // 5. Có ít nhất 1 reply
            if (Boolean.TRUE.equals(filter.getHasReply())) {
                predicates.add(cb.greaterThan(root.get("replyCount"), 0));
            } else if (Boolean.FALSE.equals(filter.getHasReply())) {
                predicates.add(cb.equal(root.get("replyCount"), 0));
            }

            // 6. Có câu trả lời hay -> subquery trên QA_REPLIES
            if (Boolean.TRUE.equals(filter.getHasAcceptedAnswer())) {
                // EXISTS (SELECT 1 FROM QA_REPLIES r WHERE r.qa_id = q.id AND r.is_answer = 1 AND r.status = 'ACTIVE')
                var subquery = query.subquery(Long.class);
                var replyRoot = subquery.from(com.travelgo.entity.QaReply.class);
                subquery.select(cb.literal(1L));
                subquery.where(
                        cb.and(
                                cb.equal(replyRoot.get("qa").get("id"), root.get("id")),
                                cb.isTrue(replyRoot.get("isAnswer")),
                                cb.equal(replyRoot.get("status"), ActiveStatus.ACTIVE)
                        )
                );
                predicates.add(cb.exists(subquery));
            }

            // 7. Khoảng thời gian nhanh
            LocalDateTime[] range = resolveDateRange(filter);
            if (range[0] != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), range[0]));
            }
            if (range[1] != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), range[1]));
            }

            // 8. From/To date cụ thể
            if (filter.getFromDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getFromDate().atStartOfDay()));
            }
            if (filter.getToDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        filter.getToDate().atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static LocalDateTime[] resolveDateRange(TourQaSearchFilter filter) {
        String quick = filter.getQuickRange();
        if (quick == null || quick.isBlank()) {
            return new LocalDateTime[]{null, null};
        }
        LocalDate today = LocalDate.now();
        return switch (quick.toUpperCase()) {
            case "TODAY" -> new LocalDateTime[]{
                    today.atStartOfDay(),
                    today.atTime(LocalTime.MAX)
            };
            case "THIS_WEEK" -> new LocalDateTime[]{
                    today.minusDays(6).atStartOfDay(),
                    today.atTime(LocalTime.MAX)
            };
            case "THIS_MONTH" -> new LocalDateTime[]{
                    today.minusDays(29).atStartOfDay(),
                    today.atTime(LocalTime.MAX)
            };
            default -> new LocalDateTime[]{null, null};
        };
    }
}
