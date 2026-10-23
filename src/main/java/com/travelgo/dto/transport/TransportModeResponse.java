package com.travelgo.dto.transport;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TransportModeResponse {
    private Long id;
    private String name;
    private String description;
    private String icon;
    private ActiveStatus status;
}
