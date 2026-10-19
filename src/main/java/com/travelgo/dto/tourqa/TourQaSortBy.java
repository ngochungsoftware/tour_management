package com.travelgo.dto.tourqa;

import lombok.Getter;

/**
 * Enum hỗ trợ sắp xếp cho Tour Q&A.
 * <ul>
 *   <li>NEWEST      : mới nhất (createdAt DESC)</li>
 *   <li>OLDEST      : cũ nhất (createdAt ASC)</li>
 *   <li>MOST_REPLIES: nhiều trả lời nhất (replyCount DESC)</li>
 *   <li>HAS_ANSWER  : câu hỏi có câu trả lời hay lên đầu</li>
 *   <li>UPDATED     : cập nhật gần nhất (updatedAt DESC)</li>
 * </ul>
 */
@Getter
public enum TourQaSortBy {
    NEWEST("createdAt", "DESC"),
    OLDEST("createdAt", "ASC"),
    MOST_REPLIES("replyCount", "DESC"),
    HAS_ANSWER("updatedAt", "DESC"),
    UPDATED("updatedAt", "DESC");

    private final String field;
    private final String direction;

    TourQaSortBy(String field, String direction) {
        this.field = field;
        this.direction = direction;
    }
}
