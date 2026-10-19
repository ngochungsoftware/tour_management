package com.travelgo.dto.review;

import com.travelgo.common.enums.ReviewStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {
    private Long id;
    private Long tourId;
    private String tourName;
    private String userName;
    private Integer rating;
    private String comment;
    private ReviewStatus status;
    private LocalDateTime createdAt;
}
