package com.travelgo.dto.tourqa;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QaReplyResponse {
    private Long id;
    private Long qaId;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String reply;
    private Boolean isAnswer;
    private ActiveStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
