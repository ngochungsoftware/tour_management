package com.travelgo.dto.schedule;

import com.travelgo.common.enums.ScheduleStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ScheduleRequest {
    @NotNull
    private Long tourId;
    @NotNull
    @FutureOrPresent
    private LocalDate departureDate;
    @NotNull
    private LocalDate returnDate;
    @NotNull
    @Min(1)
    private Integer totalSeats;
    private ScheduleStatus status;
}
