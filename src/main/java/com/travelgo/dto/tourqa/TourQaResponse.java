package com.travelgo.dto.tourqa;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class TourQaResponse {
    private Long id;
    private Long tourId;
    private String tourName;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String question;
    private ActiveStatus status;
    private Integer replyCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QaReplyResponse> replies;
}
