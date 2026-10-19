package com.travelgo.service.booking;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.dto.booking.BookingRequest;
import com.travelgo.dto.booking.BookingResponse;
import com.travelgo.entity.Booking;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Pageable;

public interface BookingService {
    BookingResponse create(BookingRequest request);
    PageResponse<BookingResponse> myBookings(Pageable pageable);
    BookingResponse myDetail(Long id);
    BookingResponse cancelMine(Long id);
    PageResponse<BookingResponse> byUser(Long userId, Pageable pageable);
    PageResponse<BookingResponse> adminSearch(Pageable pageable);
    BookingResponse adminGet(Long id);
    BookingResponse changeStatus(Long id, BookingStatus status);
    Booking find(Long id);
    BookingResponse toResponse(Booking booking);
}
