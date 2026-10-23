package com.travelgo.dto.tour;

import com.travelgo.common.enums.TourStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class TourUpdateRequest {
    private String name;
    private String description;
    private Long transportModeId;
    private Long departurePointId;
    private Long airlineId;
    private Integer durationDays;
    private Integer durationNights;
    private BigDecimal originalPrice;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private Integer maxPeople;
    private TourStatus status;
    private Boolean featured;
    private List<TourImageRequest> images;
    private List<ItineraryRequest> itineraries;
}
