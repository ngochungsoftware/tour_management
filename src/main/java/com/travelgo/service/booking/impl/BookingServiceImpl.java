package com.travelgo.service.booking.impl;

import com.travelgo.common.enums.BookingStatus;
import com.travelgo.common.enums.PaymentStatus;
import com.travelgo.common.enums.ScheduleStatus;
import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.booking.BookingRequest;
import com.travelgo.dto.booking.BookingResponse;
import com.travelgo.dto.booking.GuestRequest;
import com.travelgo.entity.Booking;
import com.travelgo.entity.BookingGuest;
import com.travelgo.entity.Coupon;
import com.travelgo.entity.Payment;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourSchedule;
import com.travelgo.entity.User;
import com.travelgo.exception.BusinessException;
import com.travelgo.exception.ForbiddenException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.booking.BookingService;
import com.travelgo.service.coupon.CouponService;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              TourRepository tourRepository,
                              TourScheduleRepository scheduleRepository,
                              UserRepository userRepository,
                              CouponService couponService) {
        this.bookingRepository = bookingRepository;
        this.tourRepository = tourRepository;
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.couponService = couponService;
    }

    @Override
    @Transactional
    public BookingResponse create(BookingRequest request) {
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour không tồn tại"));
        if (tour.getStatus() != TourStatus.ACTIVE) {
            throw new BusinessException("Tour hiện không mở bán");
        }

        TourSchedule schedule = scheduleRepository.findByIdForUpdate(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Lịch khởi hành không tồn tại"));
        if (!schedule.getTour().getId().equals(tour.getId())) {
            throw new BusinessException("Lịch khởi hành không thuộc tour này");
        }
        if (schedule.getStatus() != ScheduleStatus.OPEN) {
            throw new BusinessException("Lịch khởi hành đã đóng");
        }
        if (schedule.getDepartureDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Không thể đặt tour đã khởi hành");
        }

        int childCount = request.getChildCount() == null ? 0 : request.getChildCount();
        int infantCount = request.getInfantCount() == null ? 0 : request.getInfantCount();
        int requestedSeats = request.getAdultCount() + childCount + infantCount;
        if (requestedSeats <= 0) {
            throw new BusinessException("Số khách phải lớn hơn 0");
        }
        if (request.getGuests().size() != requestedSeats) {
            throw new BusinessException("Danh sách khách phải khớp với số người đặt");
        }
        if (schedule.getAvailableSeats() < requestedSeats) {
            throw new BusinessException("Không đủ số chỗ còn lại");
        }

        BigDecimal adultTotal = tour.getAdultPrice().multiply(BigDecimal.valueOf(request.getAdultCount()));
        BigDecimal childTotal = tour.getChildPrice().multiply(BigDecimal.valueOf(childCount));
        BigDecimal infantTotal = tour.getInfantPrice().multiply(BigDecimal.valueOf(infantCount));
        BigDecimal subtotal = adultTotal.add(childTotal).add(infantTotal);

        Coupon coupon = null;
        BigDecimal discount = BigDecimal.ZERO;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponService.validateUsable(request.getCouponCode());
            discount = subtotal.multiply(coupon.getDiscountPercent())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            coupon.setUsedCount(coupon.getUsedCount() + 1);
        }
        BigDecimal total = subtotal.subtract(discount);

        Booking booking = Booking.builder()
                .bookingCode(temporaryCode())
                .user(user)
                .tour(tour)
                .schedule(schedule)
                .coupon(coupon)
                .adultCount(request.getAdultCount())
                .childCount(childCount)
                .infantCount(infantCount)
                .subtotal(subtotal)
                .discountAmount(discount)
                .totalAmount(total)
                .status(BookingStatus.PENDING)
                .build();

        for (GuestRequest guestRequest : request.getGuests()) {
            BookingGuest guest = BookingGuest.builder()
                    .booking(booking)
                    .fullName(guestRequest.getFullName())
                    .dateOfBirth(guestRequest.getDateOfBirth())
                    .gender(guestRequest.getGender())
                    .phone(guestRequest.getPhone())
                    .email(guestRequest.getEmail())
                    .identityNumber(guestRequest.getIdentityNumber())
                    .build();
            booking.getGuests().add(guest);
        }

        schedule.setAvailableSeats(schedule.getAvailableSeats() - requestedSeats);

        Payment payment = Payment.builder()
                .booking(booking)
                .method(request.getPaymentMethod())
                .amount(total)
                .status(PaymentStatus.PENDING)
                .build();
        booking.getPayments().add(payment);

        bookingRepository.save(booking);
        booking.setBookingCode(buildCode(booking.getId()));
        return toResponse(booking);
    }

    @Override
    public PageResponse<BookingResponse> myBookings(Pageable pageable) {
        return PageResponse.of(
                bookingRepository.findByUserIdOrderByCreatedAtDesc(SecurityUtils.currentUserId(), pageable)
                        .map(this::toResponse));
    }

    @Override
    public BookingResponse myDetail(Long id) {
        Booking booking = bookingRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking không tồn tại"));
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse cancelMine(Long id) {
        Booking booking = bookingRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking không tồn tại"));
        cancel(booking);
        return toResponse(booking);
    }

    @Override
    public PageResponse<BookingResponse> byUser(Long userId, Pageable pageable) {
        return PageResponse.of(bookingRepository.findByUserId(userId, pageable).map(this::toResponse));
    }

    @Override
    public PageResponse<BookingResponse> adminSearch(Pageable pageable) {
        return PageResponse.of(bookingRepository.findAll(pageable).map(this::toResponse));
    }

    @Override
    public BookingResponse adminGet(Long id) {
        Booking booking = find(id);
        return toResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse changeStatus(Long id, BookingStatus status) {
        Booking booking = find(id);
        if (status == BookingStatus.CANCELLED) {
            cancel(booking);
            return toResponse(booking);
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking đã hủy, không thể đổi trạng thái");
        }
        booking.setStatus(status);
        return toResponse(booking);
    }

    @Override
    public Booking find(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking không tồn tại"));
    }

    private void cancel(Booking booking) {
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BusinessException("Booking đã được hủy");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BusinessException("Không thể hủy tour đã hoàn thành");
        }
        if (!booking.getSchedule().getDepartureDate().isAfter(LocalDate.now())) {
            throw new BusinessException("Không cho hủy nếu tour đã bắt đầu");
        }
        if (!booking.getUser().getId().equals(SecurityUtils.currentUserId())
                && SecurityUtils.currentUser().getRoles().stream()
                .noneMatch(role -> "ADMIN".equals(role.getName().name()))) {
            throw new ForbiddenException("Không có quyền hủy booking này");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        TourSchedule schedule = scheduleRepository.findByIdForUpdate(booking.getSchedule().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Lịch khởi hành không tồn tại"));
        schedule.setAvailableSeats(schedule.getAvailableSeats() + booking.totalPeople());
        booking.getPayments().forEach(payment -> {
            if (payment.getStatus() == PaymentStatus.PAID) {
                payment.setStatus(PaymentStatus.REFUNDED);
            } else if (payment.getStatus() == PaymentStatus.PENDING) {
                payment.setStatus(PaymentStatus.FAILED);
            }
        });
    }

    private String temporaryCode() {
        return "TMP" + System.nanoTime();
    }

    private String buildCode(Long id) {
        return "BK" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + String.format("%03d", id);
    }

    @Override
    public BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .tourId(booking.getTour() != null ? booking.getTour().getId() : null)
                .tourName(booking.getTour() != null ? booking.getTour().getName() : null)
                .tourCode(booking.getTour() != null ? booking.getTour().getCode() : null)
                .departureDate(booking.getSchedule() != null ? booking.getSchedule().getDepartureDate() : null)
                .adultCount(booking.getAdultCount())
                .childCount(booking.getChildCount())
                .infantCount(booking.getInfantCount())
                .totalPeople(booking.totalPeople())
                .subtotal(booking.getSubtotal())
                .discountAmount(booking.getDiscountAmount())
                .totalAmount(booking.getTotalAmount())
                .couponCode(booking.getCoupon() != null ? booking.getCoupon().getCode() : null)
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .guests(booking.getGuests().stream().map(g -> com.travelgo.dto.booking.GuestResponse.builder()
                        .id(g.getId())
                        .fullName(g.getFullName())
                        .dateOfBirth(g.getDateOfBirth())
                        .gender(g.getGender())
                        .phone(g.getPhone())
                        .email(g.getEmail())
                        .identityNumber(g.getIdentityNumber())
                        .build()).toList())
                .payments(booking.getPayments().stream().map(p -> com.travelgo.dto.payment.PaymentResponse.builder()
                        .id(p.getId())
                        .bookingId(booking.getId())
                        .bookingCode(booking.getBookingCode())
                        .method(p.getMethod())
                        .amount(p.getAmount())
                        .status(p.getStatus())
                        .transactionRef(p.getTransactionRef())
                        .paidAt(p.getPaidAt())
                        .build()).toList())
                .build();
    }
}
