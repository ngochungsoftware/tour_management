package com.travelgo.service.booking;

import com.travelgo.common.enums.PaymentMethod;
import com.travelgo.common.enums.ScheduleStatus;
import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.booking.BookingRequest;
import com.travelgo.dto.booking.GuestRequest;
import com.travelgo.entity.Booking;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourSchedule;
import com.travelgo.entity.User;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.security.CustomUserDetails;
import com.travelgo.service.booking.impl.BookingServiceImpl;
import com.travelgo.service.coupon.CouponService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private TourRepository tourRepository;
    @Mock private TourScheduleRepository scheduleRepository;
    @Mock private UserRepository userRepository;
    @Mock private CouponService couponService;
    @InjectMocks private BookingServiceImpl bookingService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("c@gmail.com").fullName("Customer").build();
        CustomUserDetails details = new CustomUserDetails(user);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(details, null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void rejectWhenNotEnoughSeats() {
        Tour tour = Tour.builder().id(10L).status(TourStatus.ACTIVE)
                .adultPrice(new BigDecimal("1000000"))
                .childPrice(new BigDecimal("700000"))
                .infantPrice(BigDecimal.ZERO)
                .build();
        TourSchedule schedule = TourSchedule.builder()
                .id(20L)
                .tour(tour)
                .departureDate(LocalDate.now().plusDays(5))
                .status(ScheduleStatus.OPEN)
                .availableSeats(2)
                .totalSeats(10)
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(tourRepository.findById(10L)).thenReturn(Optional.of(tour));
        when(scheduleRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(schedule));

        BookingRequest request = new BookingRequest();
        request.setTourId(10L);
        request.setScheduleId(20L);
        request.setAdultCount(3);
        request.setPaymentMethod(PaymentMethod.CASH);
        request.setGuests(List.of(guest(), guest(), guest()));

        assertThatThrownBy(() -> bookingService.create(request))
                .hasMessageContaining("Không đủ số chỗ còn lại");
    }

    private GuestRequest guest() {
        GuestRequest g = new GuestRequest();
        g.setFullName("Khach");
        return g;
    }
}
