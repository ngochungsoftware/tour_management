package com.travelgo.dto.tour;

import com.travelgo.common.enums.TourStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
public class TourCreateRequest {
    @NotBlank
    @Size(max = 50)
    private String code;
    @NotBlank
    private String name;
    @NotNull
    private Long categoryId;
    @NotNull
    private Long destinationId;
    private String description;
    @NotNull
    @Min(1)
    private Integer durationDays;
    @NotNull
    @Min(0)
    private Integer durationNights;
    @Positive
    private BigDecimal originalPrice;
    @NotNull
    @Positive
    private BigDecimal adultPrice;
    @NotNull
    @Positive
    private BigDecimal childPrice;
    @Positive
    private BigDecimal infantPrice;
    @NotNull
    @Min(1)
    private Integer maxPeople;
    private TourStatus status;
    private Boolean featured;
    @Valid
    private List<TourImageRequest> images = new ArrayList<>();
    @Valid
    private List<ItineraryRequest> itineraries = new ArrayList<>();
}
