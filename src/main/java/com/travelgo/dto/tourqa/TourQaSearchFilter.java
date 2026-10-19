package com.travelgo.dto.tourqa;

import com.travelgo.common.enums.ActiveStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
public class TourQaSearchFilter {
    /** Từ khóa tìm trong câu hỏi (LIKE %keyword%) */
    private String keyword;

    /** Lọc theo tour cụ thể */
    private Long tourId;

    /** Lọc theo user đã hỏi */
    private Long userId;

    /** Lọc theo trạng thái (mặc định ACTIVE) */
    private ActiveStatus status;

    /** Lọc câu hỏi ĐÃ có ít nhất 1 reply */
    private Boolean hasReply;

    /** Lọc câu hỏi có câu trả lời được đánh dấu hay */
    private Boolean hasAcceptedAnswer;

    /** Lọc từ ngày (createdAt >= fromDate) */
    private LocalDate fromDate;

    /** Lọc đến ngày (createdAt <= toDate) */
    private LocalDate toDate;

    /**
     * Khoảng thời gian nhanh:
     *  - TODAY     : hôm nay
     *  - THIS_WEEK : 7 ngày gần nhất
     *  - THIS_MONTH: 30 ngày gần nhất
     *  - null      : tất cả
     */
    private String quickRange;
}
