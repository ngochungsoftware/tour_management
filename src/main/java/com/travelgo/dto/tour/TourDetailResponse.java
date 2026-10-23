package com.travelgo.dto.tour;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Builder
public class TourDetailResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long destinationId;
    private String destinationName;
    private Long transportModeId;
    private String transportModeName;
    private Long departurePointId;
    private String departurePointName;
    private Long airlineId;
    private String airlineName;
    private Integer durationDays;
    private Integer durationNights;
    private BigDecimal originalPrice;
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
    private BigDecimal infantPrice;
    private Integer maxPeople;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private String status;
    private Boolean featured;
    private List<LocalDate> departureDates;
    private List<TransportSummary> transports;
    private List<String> images;
    private List<ItineraryResponse> itineraries;

    /**
     * Phương tiện di chuyển dùng cho tour (gộp từ các lịch khởi hành).
     */
    @Getter
    @Builder
    public static class TransportSummary {
        private Long transportModeId;
        private String transportModeName;
        private String transportModeIcon;
        private Long departurePointId;
        private String departurePointName;
        private Long airlineId;
        private String airlineName;
        private String airlineCode;
    }
}
