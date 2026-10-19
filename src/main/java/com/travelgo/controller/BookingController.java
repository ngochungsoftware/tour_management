package com.travelgo.controller;

import com.travelgo.dto.booking.BookingRequest;
import com.travelgo.dto.booking.BookingResponse;
import com.travelgo.service.booking.BookingService;
import com.travelgo.util.ApiResponse;
import com.travelgo.util.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        return ApiResponse.ok("Đặt tour thành công", bookingService.create(request));
    }

    @GetMapping("/my")
    public ApiResponse<PageResponse<BookingResponse>> myBookings(@PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(bookingService.myBookings(pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<BookingResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.myDetail(id));
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<BookingResponse> cancel(@PathVariable Long id) {
        return ApiResponse.ok("Hủy booking thành công", bookingService.cancelMine(id));
    }
}
