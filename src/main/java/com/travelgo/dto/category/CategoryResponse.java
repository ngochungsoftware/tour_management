package com.travelgo.dto.category;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private ActiveStatus status;
}
