package com.travelgo.dto.airline;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AirlineResponse {
    private Long id;
    private String code;
    private String name;
    private String logo;
    private ActiveStatus status;
}
