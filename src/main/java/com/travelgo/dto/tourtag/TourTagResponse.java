package com.travelgo.dto.tourtag;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TourTagResponse {
    private Long id;
    private String name;
    private String slug;
    private ActiveStatus status;
    private LocalDateTime createdAt;
}
