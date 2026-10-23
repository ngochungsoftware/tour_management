package com.travelgo.dto.banner;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.BannerPosition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BannerRequest {
    @NotBlank
    private String title;
    private String subtitle;
    @NotBlank
    private String imageUrl;
    private String linkUrl;
    @NotNull
    private BannerPosition position;
    private Integer sortOrder;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private ActiveStatus status;
}
