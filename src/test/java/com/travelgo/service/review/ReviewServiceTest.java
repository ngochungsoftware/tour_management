package com.travelgo.service.review;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.dto.review.ReviewRequest;
import com.travelgo.entity.Booking;
import com.travelgo.entity.Tour;
import com.travelgo.entity.User;
import com.travelgo.exception.BusinessException;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.ReviewRepository;
import com.travelgo.security.CustomUserDetails;
import com.travelgo.service.review.impl.ReviewServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private BookingRepository bookingRepository;
    @InjectMocks private ReviewServiceImpl reviewService;

    @BeforeEach
    void setUp() {
        User user = User.builder().id(1L).email("c@gmail.com").build();
        CustomUserDetails details = new CustomUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void cannotReviewWithoutCompletedBooking() {
        Booking booking = Booking.builder()
                .id(5L)
                .status(BookingStatus.PENDING)
                .tour(Tour.builder().id(1L).build())
                .user(User.builder().id(1L).build())
                .build();
        when(bookingRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(booking));
        ReviewRequest request = new ReviewRequest();
        request.setBookingId(5L);
        request.setRating(5);
        assertThatThrownBy(() -> reviewService.create(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("hoàn thành");
    }

    @Test
    void cannotReviewTwice() {
        Booking booking = Booking.builder()
                .id(5L)
                .status(BookingStatus.COMPLETED)
                .tour(Tour.builder().id(1L).build())
                .user(User.builder().id(1L).build())
                .build();
        when(bookingRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(booking));
        when(reviewRepository.existsByBookingId(5L)).thenReturn(true);
        ReviewRequest request = new ReviewRequest();
        request.setBookingId(5L);
        request.setRating(4);
        assertThatThrownBy(() -> reviewService.create(request))
                .hasMessageContaining("đã được đánh giá");
    }
}
