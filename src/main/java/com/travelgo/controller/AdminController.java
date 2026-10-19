package com.travelgo.controller;

import com.travelgo.common.enums.*;
import com.travelgo.dto.admin.DashboardResponse;
import com.travelgo.dto.booking.BookingResponse;
import com.travelgo.dto.category.CategoryRequest;
import com.travelgo.dto.category.CategoryResponse;
import com.travelgo.dto.coupon.CouponRequest;
import com.travelgo.dto.coupon.CouponResponse;
import com.travelgo.dto.destination.DestinationRequest;
import com.travelgo.dto.destination.DestinationResponse;
import com.travelgo.dto.payment.PaymentResponse;
import com.travelgo.dto.post.PostCommentResponse;
import com.travelgo.dto.post.PostRequest;
import com.travelgo.dto.post.PostResponse;
import com.travelgo.dto.review.ReviewResponse;
import com.travelgo.dto.tourqa.QaReplyResponse;
import com.travelgo.dto.tourqa.TourQaResponse;
import com.travelgo.dto.tourqa.TourQaSearchFilter;
import com.travelgo.dto.tourqa.TourQaSortBy;
import com.travelgo.dto.schedule.ScheduleRequest;
import com.travelgo.dto.schedule.ScheduleResponse;
import com.travelgo.dto.tour.TourCreateRequest;
import com.travelgo.dto.tour.TourDetailResponse;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.dto.tour.TourUpdateRequest;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.entity.Tour;
import com.travelgo.service.admin.AdminService;
import com.travelgo.service.booking.BookingService;
import com.travelgo.service.category.CategoryService;
import com.travelgo.service.coupon.CouponService;
import com.travelgo.service.destination.DestinationService;
import com.travelgo.service.payment.PaymentService;
import com.travelgo.service.post.PostCommentService;
import com.travelgo.service.post.PostService;
import com.travelgo.service.review.ReviewService;
import com.travelgo.service.tourqa.TourQaService;
import com.travelgo.service.schedule.ScheduleService;
import com.travelgo.service.tour.TourService;
import com.travelgo.util.ApiResponse;
import com.travelgo.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminService adminService;
    private final BookingService bookingService;
    private final TourService tourService;
    private final CategoryService categoryService;
    private final DestinationService destinationService;
    private final ScheduleService scheduleService;
    private final CouponService couponService;
    private final ReviewService reviewService;
    private final PaymentService paymentService;
    private final PostService postService;
    private final PostCommentService postCommentService;
    private final TourQaService tourQaService;

    public AdminController(AdminService adminService,
                           BookingService bookingService,
                           TourService tourService,
                           CategoryService categoryService,
                           DestinationService destinationService,
                           ScheduleService scheduleService,
                           CouponService couponService,
                           ReviewService reviewService,
                           PaymentService paymentService,
                           PostService postService,
                           PostCommentService postCommentService,
                           TourQaService tourQaService) {
        this.adminService = adminService;
        this.bookingService = bookingService;
        this.tourService = tourService;
        this.categoryService = categoryService;
        this.destinationService = destinationService;
        this.scheduleService = scheduleService;
        this.couponService = couponService;
        this.reviewService = reviewService;
        this.paymentService = paymentService;
        this.postService = postService;
        this.postCommentService = postCommentService;
        this.tourQaService = tourQaService;
    }

    // === Dashboard ===
    @GetMapping("/dashboard")
    public ApiResponse<DashboardResponse> dashboard() {
        return ApiResponse.ok(adminService.dashboard());
    }

    // === Users ===
    @GetMapping("/users")
    public ApiResponse<PageResponse<UserResponse>> users(@RequestParam(required = false) String keyword,
                                                         @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(adminService.users(keyword, pageable)));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<UserResponse> user(@PathVariable Long id) {
        return ApiResponse.ok(adminService.userDetail(id));
    }

    @PatchMapping("/users/{id}/lock")
    public ApiResponse<UserResponse> lock(@PathVariable Long id) {
        return ApiResponse.ok("Đã khóa tài khoản", adminService.changeUserStatus(id, UserStatus.LOCKED));
    }

    @PatchMapping("/users/{id}/unlock")
    public ApiResponse<UserResponse> unlock(@PathVariable Long id) {
        return ApiResponse.ok("Đã mở khóa tài khoản", adminService.changeUserStatus(id, UserStatus.ACTIVE));
    }

    @GetMapping("/users/{id}/bookings")
    public ApiResponse<PageResponse<BookingResponse>> userBookings(@PathVariable Long id,
                                                                   @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(bookingService.byUser(id, pageable));
    }

    // === Bookings ===
    @GetMapping("/bookings")
    public ApiResponse<PageResponse<BookingResponse>> bookings(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(bookingService.adminSearch(pageable));
    }

    @GetMapping("/bookings/{id}")
    public ApiResponse<BookingResponse> booking(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.adminGet(id));
    }

    @PatchMapping("/bookings/{id}/confirm")
    public ApiResponse<BookingResponse> confirm(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.changeStatus(id, BookingStatus.CONFIRMED));
    }

    @PatchMapping("/bookings/{id}/cancel")
    public ApiResponse<BookingResponse> cancel(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.changeStatus(id, BookingStatus.CANCELLED));
    }

    @PatchMapping("/bookings/{id}/complete")
    public ApiResponse<BookingResponse> complete(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.changeStatus(id, BookingStatus.COMPLETED));
    }

    // === Tours ===
    @GetMapping("/tours")
    public ApiResponse<PageResponse<TourResponse>> tours(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer durationDays,
            @RequestParam(required = false) LocalDate departureDate,
            @RequestParam(required = false) TourStatus status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean discount,
            @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(tourService.search(keyword, categoryId, destinationId, minPrice, maxPrice,
                durationDays, departureDate, status, featured, discount, pageable));
    }

    @GetMapping("/tours/{id}")
    public ApiResponse<TourDetailResponse> tour(@PathVariable Long id) {
        return ApiResponse.ok(tourService.getDetail(id));
    }

    @PostMapping("/tours")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TourDetailResponse> createTour(@Valid @RequestBody TourCreateRequest request) {
        return ApiResponse.ok("Tạo tour thành công", tourService.create(request));
    }

    @PutMapping("/tours/{id}")
    public ApiResponse<TourDetailResponse> updateTour(@PathVariable Long id, @Valid @RequestBody TourUpdateRequest request) {
        Tour tour = tourService.find(id);
        TourCreateRequest create = mapToCreate(request, tour.getCode());
        return ApiResponse.ok("Cập nhật tour thành công", tourService.update(id, create));
    }

    @DeleteMapping("/tours/{id}")
    public ApiResponse<Void> deleteTour(@PathVariable Long id) {
        tourService.delete(id);
        return ApiResponse.message("Đã xóa tour");
    }

    @PatchMapping("/tours/{id}/hide")
    public ApiResponse<TourDetailResponse> hideTour(@PathVariable Long id) {
        return ApiResponse.ok(tourService.changeVisibility(id, TourStatus.HIDDEN));
    }

    @PatchMapping("/tours/{id}/show")
    public ApiResponse<TourDetailResponse> showTour(@PathVariable Long id) {
        return ApiResponse.ok(tourService.changeVisibility(id, TourStatus.ACTIVE));
    }

    private TourCreateRequest mapToCreate(TourUpdateRequest request, String code) {
        return TourCreateRequest.builder()
                .code(code)
                .name(request.getName())
                .description(request.getDescription())
                .durationDays(request.getDurationDays())
                .durationNights(request.getDurationNights())
                .originalPrice(request.getOriginalPrice())
                .adultPrice(request.getAdultPrice())
                .childPrice(request.getChildPrice())
                .infantPrice(request.getInfantPrice())
                .maxPeople(request.getMaxPeople())
                .status(request.getStatus())
                .featured(request.getFeatured())
                .build();
    }

    // === Categories ===
    @GetMapping("/categories")
    public ApiResponse<PageResponse<CategoryResponse>> categories(@RequestParam(required = false) String keyword,
                                                                  @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(categoryService.search(keyword, pageable)));
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.create(request));
    }

    @PutMapping("/categories/{id}")
    public ApiResponse<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ApiResponse.ok(categoryService.update(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.message("Đã xóa danh mục");
    }

    // === Destinations ===
    @GetMapping("/destinations")
    public ApiResponse<PageResponse<DestinationResponse>> destinations(@RequestParam(required = false) String keyword,
                                                                       @PageableDefault(size = 20) Pageable pageable) {
        return ApiResponse.ok(PageResponse.of(destinationService.search(keyword, pageable)));
    }

    @PostMapping("/destinations")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DestinationResponse> createDestination(@Valid @RequestBody DestinationRequest request) {
        return ApiResponse.ok(destinationService.create(request));
    }

    @PutMapping("/destinations/{id}")
    public ApiResponse<DestinationResponse> updateDestination(@PathVariable Long id,
                                                              @Valid @RequestBody DestinationRequest request) {
        return ApiResponse.ok(destinationService.update(id, request));
    }

    @DeleteMapping("/destinations/{id}")
    public ApiResponse<Void> deleteDestination(@PathVariable Long id) {
        destinationService.delete(id);
        return ApiResponse.message("Đã xóa điểm đến");
    }

    // === Schedules ===
    @GetMapping("/schedules")
    public ApiResponse<List<ScheduleResponse>> schedules(@RequestParam Long tourId) {
        return ApiResponse.ok(scheduleService.findByTour(tourId));
    }

    @PostMapping("/schedules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleResponse> createSchedule(@Valid @RequestBody ScheduleRequest request) {
        return ApiResponse.ok(scheduleService.create(request));
    }

    @PutMapping("/schedules/{id}")
    public ApiResponse<ScheduleResponse> updateSchedule(@PathVariable Long id, @Valid @RequestBody ScheduleRequest request) {
        return ApiResponse.ok(scheduleService.update(id, request));
    }

    @DeleteMapping("/schedules/{id}")
    public ApiResponse<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.delete(id);
        return ApiResponse.message("Đã xóa lịch khởi hành");
    }

    // === Coupons ===
    @GetMapping("/coupons")
    public ApiResponse<List<CouponResponse>> coupons() {
        return ApiResponse.ok(couponService.findAll());
    }

    @PostMapping("/coupons")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CouponResponse> createCoupon(@Valid @RequestBody CouponRequest request) {
        return ApiResponse.ok(couponService.create(request));
    }

    @PutMapping("/coupons/{id}")
    public ApiResponse<CouponResponse> updateCoupon(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        return ApiResponse.ok(couponService.update(id, request));
    }

    @DeleteMapping("/coupons/{id}")
    public ApiResponse<Void> deleteCoupon(@PathVariable Long id) {
        couponService.delete(id);
        return ApiResponse.message("Đã xóa coupon");
    }

    // === Reviews ===
    @GetMapping("/reviews")
    public ApiResponse<List<ReviewResponse>> reviews() {
        return ApiResponse.ok(reviewService.adminAll());
    }

    @PatchMapping("/reviews/{id}/hide")
    public ApiResponse<ReviewResponse> hideReview(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.changeVisibility(id, ReviewStatus.HIDDEN));
    }

    @PatchMapping("/reviews/{id}/show")
    public ApiResponse<ReviewResponse> showReview(@PathVariable Long id) {
        return ApiResponse.ok(reviewService.changeVisibility(id, ReviewStatus.VISIBLE));
    }

    @DeleteMapping("/reviews/{id}")
    public ApiResponse<Void> deleteReview(@PathVariable Long id) {
        reviewService.delete(id);
        return ApiResponse.message("Đã xóa đánh giá");
    }

    // === Payments ===
    @GetMapping("/payments")
    public ApiResponse<List<PaymentResponse>> payments() {
        return ApiResponse.ok(paymentService.findAll());
    }

    // === Posts ===
    @GetMapping("/posts")
    public ApiResponse<PageResponse<PostResponse>> adminPosts(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(postService.searchPublished(null, null, pageable));
    }

    @PostMapping("/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        return ApiResponse.ok(postService.create(request));
    }

    @PutMapping("/posts/{id}")
    public ApiResponse<PostResponse> updatePost(@PathVariable Long id,
                                               @Valid @RequestBody PostRequest request) {
        return ApiResponse.ok(postService.update(id, request));
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> deletePost(@PathVariable Long id) {
        postService.delete(id);
        return ApiResponse.message("Đã xóa bài viết");
    }

    // === Post Comments ===
    @GetMapping("/post-comments/post/{postId}")
    public ApiResponse<List<PostCommentResponse>> adminPostComments(@PathVariable Long postId) {
        return ApiResponse.ok(postCommentService.getAllCommentsByPost(postId));
    }

    @DeleteMapping("/post-comments/{id}")
    public ApiResponse<Void> deletePostComment(@PathVariable Long id) {
        postCommentService.delete(id);
        return ApiResponse.message("Đã xóa bình luận");
    }

    // === Tour Q&A ===
    @GetMapping("/tour-qa/search")
    public ApiResponse<PageResponse<TourQaResponse>> adminTourQaSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long tourId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) ActiveStatus status,
            @RequestParam(required = false) Boolean hasReply,
            @RequestParam(required = false) Boolean hasAcceptedAnswer,
            @RequestParam(required = false) String quickRange,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate,
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

    @GetMapping("/tour-qa/{id}")
    public ApiResponse<TourQaResponse> adminGetQuestion(@PathVariable Long id) {
        return ApiResponse.ok(tourQaService.getById(id));
    }

    @DeleteMapping("/tour-qa/{id}")
    public ApiResponse<Void> adminDeleteQuestion(@PathVariable Long id) {
        tourQaService.deleteMyQuestion(id);
        return ApiResponse.message("Đã xóa câu hỏi");
    }

    @GetMapping("/tour-qa/{qaId}/replies")
    public ApiResponse<List<QaReplyResponse>> adminGetReplies(@PathVariable Long qaId) {
        return ApiResponse.ok(tourQaService.getReplies(qaId));
    }

    @DeleteMapping("/tour-qa/replies/{replyId}")
    public ApiResponse<Void> adminDeleteReply(@PathVariable Long replyId) {
        tourQaService.deleteMyReply(replyId);
        return ApiResponse.message("Đã xóa trả lời");
    }
}
