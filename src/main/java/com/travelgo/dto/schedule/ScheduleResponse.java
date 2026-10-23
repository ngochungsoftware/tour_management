package com.travelgo.dto.schedule;

import com.travelgo.common.enums.ScheduleStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Builder
public class ScheduleResponse {
    private Long id;
    private Long tourId;
    private String tourName;
    private LocalDate departureDate;
    private LocalDate returnDate;
    private Integer totalSeats;
    private Integer availableSeats;
    private ScheduleStatus status;

    // Điểm khởi hành
    private Long departurePointId;
    private String departurePointName;

    // Phương tiện di chuyển
    private Long transportModeId;
    private String transportModeName;
    private String transportModeIcon;

    // Hãng hàng không
    private Long airlineId;
    private String airlineName;
    private String airlineCode;

    // Giá riêng của chuyến (null = dùng giá của tour)
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
}