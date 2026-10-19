package com.travelgo.dto.tour;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ItineraryResponse {
    private Long id;
    private Integer dayNumber;
    private String title;
    private String description;
}
