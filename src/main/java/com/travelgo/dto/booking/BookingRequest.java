package com.travelgo.dto.booking;

import com.travelgo.common.enums.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class BookingRequest {
    @NotNull
    private Long tourId;
    @NotNull
    private Long scheduleId;
    @NotNull
    @Min(1)
    private Integer adultCount;
    @Min(0)
    private Integer childCount;
    @Min(0)
    private Integer infantCount;
    private String couponCode;
    @NotNull
    private PaymentMethod paymentMethod;
    // Phương tiện khách chọn (optional). Nếu không chọn thì mặc định lấy phương tiện
    // của lịch khởi hành, hoặc của tour nếu lịch chưa gán riêng.
    private Long transportModeId;
    private Long airlineId;
    private Long departurePointId;
    @NotEmpty
    @Valid
    private List<GuestRequest> guests;
}
