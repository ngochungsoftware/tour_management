package com.travelgo.dto.attraction;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AttractionResponse {
    private Long id;
    private String name;
    private Long destinationId;
    private String destinationName;
    private String description;
    private String image;
    private String address;
    private ActiveStatus status;
    private LocalDateTime createdAt;
}
