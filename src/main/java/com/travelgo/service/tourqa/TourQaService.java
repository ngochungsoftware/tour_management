package com.travelgo.service.tourqa;

import com.travelgo.dto.tourqa.*;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TourQaService {
    PageResponse<TourQaResponse> getByTour(Long tourId, Pageable pageable);
    PageResponse<TourQaResponse> getAllVisible(Pageable pageable);
    List<TourQaResponse> getMyQuestions();
    TourQaResponse getById(Long id);
    TourQaResponse create(TourQaRequest request);
    void deleteMyQuestion(Long id);
    TourQaResponse changeStatus(Long id, com.travelgo.common.enums.ActiveStatus status);
    QaReplyResponse addReply(QaReplyRequest request);
    List<QaReplyResponse> getReplies(Long qaId);
    void deleteMyReply(Long replyId);
    QaReplyResponse markAsAnswer(Long replyId);
    QaReplyResponse unmarkAsAnswer(Long replyId);
    QaReplyResponse changeReplyStatus(Long replyId, com.travelgo.common.enums.ActiveStatus status);

    // ===== Advanced search =====
    PageResponse<TourQaResponse> search(TourQaSearchFilter filter, TourQaSortBy sortBy, Pageable pageable);
    List<TourQaResponse> getFaq(int limit);
}
