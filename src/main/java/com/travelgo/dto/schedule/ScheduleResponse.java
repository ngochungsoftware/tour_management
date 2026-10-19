package com.travelgo.dto.schedule;

import com.travelgo.common.enums.ScheduleStatus;
import lombok.Builder;
import lombok.Getter;

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
}
