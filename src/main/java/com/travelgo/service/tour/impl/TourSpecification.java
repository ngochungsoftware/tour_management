package com.travelgo.service.tour.impl;

import com.travelgo.common.enums.TourStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

final class TourSpecification {

    private TourSpecification() {
    }

    static Specification<com.travelgo.entity.Tour> filter(String keyword,
                                                          Long categoryId,
                                                          Long destinationId,
                                                          BigDecimal minPrice,
                                                          BigDecimal maxPrice,
                                                          Integer durationDays,
                                                          LocalDate departureDate,
                                                          TourStatus status,
                                                          Boolean featured,
                                                          Boolean discount) {
        return (root, query, cb) -> {
            if (query != null) {
                query.distinct(true);
                Class<?> resultType = query.getResultType();
                if (resultType != Long.class && resultType != long.class) {
                    root.fetch("category", JoinType.LEFT);
                    root.fetch("destination", JoinType.LEFT);
                    root.fetch("images", JoinType.LEFT);
                }
            }
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), like);
                Predicate destLike = cb.like(cb.lower(root.join("destination", JoinType.LEFT).get("name")), like);
                Predicate catLike = cb.like(cb.lower(root.join("category", JoinType.LEFT).get("name")), like);
                predicates.add(cb.or(nameLike, destLike, catLike));
            }
            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (destinationId != null) {
                predicates.add(cb.equal(root.get("destination").get("id"), destinationId));
            }
            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("adultPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("adultPrice"), maxPrice));
            }
            if (durationDays != null) {
                predicates.add(cb.equal(root.get("durationDays"), durationDays));
            }
            if (departureDate != null) {
                var schedules = root.join("schedules", JoinType.INNER);
                predicates.add(cb.equal(schedules.get("departureDate"), departureDate));
            }
            if (Boolean.TRUE.equals(featured)) {
                predicates.add(cb.isTrue(root.get("featured")));
            }
            if (Boolean.TRUE.equals(discount)) {
                predicates.add(cb.and(
                        cb.isNotNull(root.get("originalPrice")),
                        cb.greaterThan(root.get("originalPrice"), root.get("adultPrice"))
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
