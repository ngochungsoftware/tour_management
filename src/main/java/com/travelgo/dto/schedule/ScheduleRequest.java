package com.travelgo.dto.schedule;

import com.travelgo.common.enums.ScheduleStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
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

    // Điểm khởi hành (ga tàu / sân bay / bến xe)
    private Long departurePointId;

    // Phương tiện di chuyển (máy bay, tàu hỏa, xe khách...)
    private Long transportModeId;

    // Hãng hàng không (chỉ dùng khi phương tiện là máy bay)
    private Long airlineId;

    // Đặt true để gỡ hãng bay khi chuyển sang phương tiện không phải máy bay
    private Boolean clearAirline;

    // Giá riêng của chuyến (để trống = dùng giá của tour)
    private BigDecimal adultPrice;
    private BigDecimal childPrice;
}
