package com.travelgo.dto.destination;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DestinationResponse {
    private Long id;
    private String name;
    private String province;
    private String description;
    private String image;
    private ActiveStatus status;
}
