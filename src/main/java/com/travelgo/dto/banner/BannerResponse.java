package com.travelgo.dto.banner;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.BannerPosition;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class BannerResponse {
    private Long id;
    private String title;
    private String subtitle;
    private String imageUrl;
    private String linkUrl;
    private BannerPosition position;
    private Integer sortOrder;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ActiveStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
