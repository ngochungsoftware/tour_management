package com.travelgo.dto.departure;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DeparturePointResponse {
    private Long id;
    private String name;
    private String city;
    private String address;
    private ActiveStatus status;
}
