package com.travelgo.controller;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.tourqa.QaReplyRequest;
import com.travelgo.dto.tourqa.QaReplyResponse;
import com.travelgo.dto.tourqa.TourQaRequest;
import com.travelgo.dto.tourqa.TourQaResponse;
import com.travelgo.dto.tourqa.TourQaSearchFilter;
import com.travelgo.dto.tourqa.TourQaSortBy;
import com.travelgo.service.tourqa.TourQaService;
import com.travelgo.util.ApiResponse;
import com.travelgo.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tour-qa")
public class TourQaController {

    private final TourQaService tourQaService;

    public TourQaController(TourQaService tourQaService) {
        this.tourQaService = tourQaService;
    }

    // ===== Questions =====

    @GetMapping("/tour/{tourId}")
    public ApiResponse<PageResponse<TourQaResponse>> getByTour(
            @PathVariable Long tourId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ApiResponse.ok(tourQaService.getByTour(tourId, pageable));
    }

    @GetMapping
    public ApiResponse<PageResponse<TourQaResponse>> getAll(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ApiResponse.ok(tourQaService.getAllVisible(pageable));
    }

    @GetMapping("/my")
    public ApiResponse<List<TourQaResponse>> getMyQuestions() {
        return ApiResponse.ok(tourQaService.getMyQuestions());
    }

    @GetMapping("/{id}")
    public ApiResponse<TourQaResponse> getById(@PathVariable Long id) {
        return ApiResponse.ok(tourQaService.getById(id));
    }

    // ===== Advanced Search & Filter =====

    /**
     * Tìm kiếm & lọc nâng cao.
     * <p>Các tham số (tất cả optional):</p>
     * <ul>
     *   <li><b>keyword</b> - từ khóa tìm trong câu hỏi</li>
     *   <li><b>tourId</b> - lọc theo tour cụ thể</li>
     *   <li><b>userId</b> - lọc theo user đã hỏi</li>
     *   <li><b>status</b> - ACTIVE / INACTIVE (mặc định ACTIVE)</li>
     *   <li><b>hasReply</b> - true: có reply, false: chưa có reply</li>
     *   <li><b>hasAcceptedAnswer</b> - true: có câu trả lời hay</li>
     *   <li><b>quickRange</b> - TODAY / THIS_WEEK / THIS_MONTH</li>
     *   <li><b>fromDate</b>, <b>toDate</b> - khoảng thời gian (yyyy-MM-dd)</li>
     *   <li><b>sortBy</b> - NEWEST / OLDEST / MOST_REPLIES / HAS_ANSWER / UPDATED</li>
     *   <li><b>page</b>, <b>size</b> - phân trang</li>
     * </ul>
     */
    @GetMapping("/search")
    public ApiResponse<PageResponse<TourQaResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long tourId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) ActiveStatus status,
            @RequestParam(required = false) Boolean hasReply,
            @RequestParam(required = false) Boolean hasAcceptedAnswer,
            @RequestParam(required = false) String quickRange,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false, defaultValue = "NEWEST") TourQaSortBy sortBy,
            @PageableDefault(size = 10) Pageable pageable) {

        TourQaSearchFilter filter = TourQaSearchFilter.builder()
                .keyword(keyword)
                .tourId(tourId)
                .userId(userId)
                .status(status)
                .hasReply(hasReply)
                .hasAcceptedAnswer(hasAcceptedAnswer)
                .quickRange(quickRange)
                .fromDate(fromDate)
                .toDate(toDate)
                .build();

        return ApiResponse.ok(tourQaService.search(filter, sortBy, pageable));
    }

    /**
     * Lấy FAQ - top câu hỏi có câu trả lời hay được đánh dấu.
     */
    @GetMapping("/faq")
    public ApiResponse<List<TourQaResponse>> faq(
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok(tourQaService.getFaq(limit));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TourQaResponse> create(@Valid @RequestBody TourQaRequest request) {
        return ApiResponse.ok("Đặt câu hỏi thành công", tourQaService.create(request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMyQuestion(@PathVariable Long id) {
        tourQaService.deleteMyQuestion(id);
        return ApiResponse.message("Đã xóa câu hỏi");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<TourQaResponse> changeStatus(@PathVariable Long id,
                                                    @RequestParam ActiveStatus status) {
        return ApiResponse.ok("Đã cập nhật trạng thái", tourQaService.changeStatus(id, status));
    }

    // ===== Replies =====

    @GetMapping("/{qaId}/replies")
    public ApiResponse<List<QaReplyResponse>> getReplies(@PathVariable Long qaId) {
        return ApiResponse.ok(tourQaService.getReplies(qaId));
    }

    @PostMapping("/replies")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<QaReplyResponse> addReply(@Valid @RequestBody QaReplyRequest request) {
        return ApiResponse.ok("Trả lời thành công", tourQaService.addReply(request));
    }

    @DeleteMapping("/replies/{replyId}")
    public ApiResponse<Void> deleteReply(@PathVariable Long replyId) {
        tourQaService.deleteMyReply(replyId);
        return ApiResponse.message("Đã xóa trả lời");
    }

    @PatchMapping("/replies/{replyId}/mark-answer")
    public ApiResponse<QaReplyResponse> markAsAnswer(@PathVariable Long replyId) {
        return ApiResponse.ok("Đã đánh dấu là câu trả lời hay", tourQaService.markAsAnswer(replyId));
    }

    @PatchMapping("/replies/{replyId}/unmark-answer")
    public ApiResponse<QaReplyResponse> unmarkAsAnswer(@PathVariable Long replyId) {
        return ApiResponse.ok("Đã bỏ đánh dấu", tourQaService.unmarkAsAnswer(replyId));
    }

    @PatchMapping("/replies/{replyId}/status")
    public ApiResponse<QaReplyResponse> changeReplyStatus(@PathVariable Long replyId,
                                                          @RequestParam ActiveStatus status) {
        return ApiResponse.ok("Đã cập nhật trạng thái trả lời",
                tourQaService.changeReplyStatus(replyId, status));
    }
}
