package com.travelgo.service.booking.impl;

import com.travelgo.common.enums.ActiveStatus;
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
import com.travelgo.entity.Airline;
import com.travelgo.entity.DeparturePoint;
import com.travelgo.entity.Payment;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourSchedule;
import com.travelgo.entity.TransportMode;
import com.travelgo.entity.User;
import com.travelgo.exception.BusinessException;
import com.travelgo.exception.ForbiddenException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.AirlineRepository;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.DeparturePointRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.repository.TransportModeRepository;
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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;
    private final TransportModeRepository transportModeRepository;
    private final AirlineRepository airlineRepository;
    private final DeparturePointRepository departurePointRepository;

    public BookingServiceImpl(BookingRepository bookingRepository,
                              TourRepository tourRepository,
                              TourScheduleRepository scheduleRepository,
                              UserRepository userRepository,
                              CouponService couponService,
                              TransportModeRepository transportModeRepository,
                              AirlineRepository airlineRepository,
                              DeparturePointRepository departurePointRepository) {
        this.bookingRepository = bookingRepository;
        this.tourRepository = tourRepository;
        this.scheduleRepository = scheduleRepository;
        this.userRepository = userRepository;
        this.couponService = couponService;
        this.transportModeRepository = transportModeRepository;
        this.airlineRepository = airlineRepository;
        this.departurePointRepository = departurePointRepository;
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

        // Phương tiện: khách được chọn tự do trong danh sách tour cung cấp.
        // Nếu khách không chọn thì mặc định lấy phương tiện của lịch, hoặc của tour.
        TransportChoice choice = resolveTransportChoice(request, schedule, tour);

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
                .transportMode(choice.transportMode())
                .airline(choice.airline())
                .departurePoint(choice.departurePoint())
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

    /**
     * Xác định phương tiện khách chọn.
     * <p>
     * Danh sách phương tiện hợp lệ được gom từ cấp tour và từ các lịch khởi hành
     * (lịch chưa gán riêng thì kế thừa từ tour) — giống hệt dữ liệu khách nhìn
     * thấy ở trang chi tiết tour. Khách chỉ được chọn trong tập đó.
     * <p>
     * Nếu khách không chọn gì thì mặc định lấy phương tiện của lịch đang đặt,
     * fallback sang phương tiện cấp tour.
     */
    private TransportChoice resolveTransportChoice(BookingRequest request, TourSchedule schedule, Tour tour) {
        List<TransportCombo> allowed = allowedTransports(tour);

        Long requestedModeId = request.getTransportModeId();
        Long requestedAirlineId = request.getAirlineId();
        Long requestedPointId = request.getDeparturePointId();

        // Khách không chọn → mặc định theo lịch, fallback tour.
        if (requestedModeId == null && requestedAirlineId == null && requestedPointId == null) {
            TransportCombo fallback = comboOf(schedule.getTransportMode(), schedule.getDeparturePoint(), schedule.getAirline());
            if (fallback == null) {
                fallback = comboOf(tour.getTransportMode(), tour.getDeparturePoint(), tour.getAirline());
            }
            if (fallback == null) {
                return new TransportChoice(null, null, null);
            }
            return new TransportChoice(fallback.mode(), fallback.airline(), fallback.departurePoint());
        }

        if (requestedModeId == null) {
            throw new BusinessException("Vui lòng chọn phương tiện di chuyển");
        }

        TransportMode mode = transportModeRepository.findById(requestedModeId)
                .orElseThrow(() -> new ResourceNotFoundException("Phương tiện di chuyển không tồn tại"));
        if (mode.getStatus() != ActiveStatus.ACTIVE) {
            throw new BusinessException("Phương tiện di chuyển đã ngừng hoạt động");
        }

        // Tìm combo khớp trong danh sách phương tiện của tour.
        TransportCombo matched = allowed.stream()
                .filter(c -> c.mode() != null && c.mode().getId().equals(requestedModeId))
                .filter(c -> requestedAirlineId == null
                        || (c.airline() != null && c.airline().getId().equals(requestedAirlineId)))
                .filter(c -> requestedPointId == null
                        || (c.departurePoint() != null && c.departurePoint().getId().equals(requestedPointId)))
                .findFirst()
                .orElseThrow(() -> new BusinessException("Phương tiện di chuyển không thuộc tour này"));

        Airline airline = matched.airline();
        if (airline == null && requestedAirlineId != null) {
            airline = airlineRepository.findById(requestedAirlineId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hãng hàng không không tồn tại"));
        }
        DeparturePoint point = matched.departurePoint();
        if (point == null && requestedPointId != null) {
            point = departurePointRepository.findById(requestedPointId)
                    .orElseThrow(() -> new ResourceNotFoundException("Điểm khởi hành không tồn tại"));
        }

        return new TransportChoice(mode, airline, point);
    }

    /**
     * Gom các combo phương tiện khách được phép chọn cho tour này, loại trùng.
     */
    private List<TransportCombo> allowedTransports(Tour tour) {
        Map<String, TransportCombo> unique = new LinkedHashMap<>();
        addCombo(unique, comboOf(tour.getTransportMode(), tour.getDeparturePoint(), tour.getAirline()));
        for (TourSchedule schedule : tour.getSchedules()) {
            if (schedule.getTransportMode() == null) {
                addCombo(unique, comboOf(tour.getTransportMode(), tour.getDeparturePoint(), tour.getAirline()));
            } else {
                addCombo(unique, comboOf(schedule.getTransportMode(), schedule.getDeparturePoint(), schedule.getAirline()));
            }
        }
        return List.copyOf(unique.values());
    }

    private void addCombo(Map<String, TransportCombo> unique, TransportCombo combo) {
        if (combo == null || combo.mode() == null) {
            return;
        }
        String key = combo.mode().getId() + "|"
                + (combo.airline() != null ? combo.airline().getId() : 0) + "|"
                + (combo.departurePoint() != null ? combo.departurePoint().getId() : 0);
        unique.putIfAbsent(key, combo);
    }

    private TransportCombo comboOf(TransportMode mode, DeparturePoint point, Airline airline) {
        if (mode == null) {
            return null;
        }
        return new TransportCombo(mode, airline, point);
    }

    /** Combo phương tiện + hãng bay + điểm khởi hành. */
    private record TransportCombo(TransportMode mode, Airline airline, DeparturePoint departurePoint) {
    }

    /** Kết quả resolve phương tiện để lưu vào booking. */
    private record TransportChoice(TransportMode transportMode, Airline airline, DeparturePoint departurePoint) {
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
                && !SecurityUtils.isStaff()) {
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
                .transportModeId(booking.getTransportMode() != null ? booking.getTransportMode().getId() : null)
                .transportModeName(booking.getTransportMode() != null ? booking.getTransportMode().getName() : null)
                .transportModeIcon(booking.getTransportMode() != null ? booking.getTransportMode().getIcon() : null)
                .airlineId(booking.getAirline() != null ? booking.getAirline().getId() : null)
                .airlineName(booking.getAirline() != null ? booking.getAirline().getName() : null)
                .departurePointId(booking.getDeparturePoint() != null ? booking.getDeparturePoint().getId() : null)
                .departurePointName(booking.getDeparturePoint() != null ? booking.getDeparturePoint().getName() : null)
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
