package com.travelgo.service.tour.impl;

import com.travelgo.common.enums.ScheduleStatus;
import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.tour.ItineraryRequest;
import com.travelgo.dto.tour.TourCreateRequest;
import com.travelgo.dto.tour.TourDetailResponse;
import com.travelgo.dto.tour.TourImageRequest;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.dto.tour.TourUpdateRequest;
import com.travelgo.entity.Category;
import com.travelgo.entity.Airline;
import com.travelgo.entity.DeparturePoint;
import com.travelgo.entity.Destination;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourImage;
import com.travelgo.entity.TourItinerary;
import com.travelgo.entity.TourSchedule;
import com.travelgo.entity.TransportMode;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.repository.TransportModeRepository;
import com.travelgo.repository.DeparturePointRepository;
import com.travelgo.repository.AirlineRepository;
import com.travelgo.service.category.CategoryService;
import com.travelgo.service.destination.DestinationService;
import com.travelgo.service.tour.TourService;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final TourScheduleRepository scheduleRepository;
    private final CategoryService categoryService;
    private final DestinationService destinationService;
    private final TransportModeRepository transportModeRepository;
    private final DeparturePointRepository departurePointRepository;
    private final AirlineRepository airlineRepository;

    public TourServiceImpl(TourRepository tourRepository,
                           TourScheduleRepository scheduleRepository,
                           CategoryService categoryService,
                           DestinationService destinationService,
                           TransportModeRepository transportModeRepository,
                           DeparturePointRepository departurePointRepository,
                           AirlineRepository airlineRepository) {
        this.tourRepository = tourRepository;
        this.scheduleRepository = scheduleRepository;
        this.categoryService = categoryService;
        this.destinationService = destinationService;
        this.transportModeRepository = transportModeRepository;
        this.departurePointRepository = departurePointRepository;
        this.airlineRepository = airlineRepository;
    }

    @Override
    public PageResponse<TourResponse> search(String keyword,
                                             Long categoryId,
                                             Long destinationId,
                                             BigDecimal minPrice,
                                             BigDecimal maxPrice,
                                             Integer durationDays,
                                             LocalDate departureDate,
                                             TourStatus status,
                                             Boolean featured,
                                             Boolean discount,
                                             Pageable pageable) {
        Page<Tour> page = tourRepository.findAll(
                TourSpecification.filter(keyword, categoryId, destinationId, minPrice, maxPrice,
                        durationDays, departureDate, status, featured, discount),
                pageable);
        return PageResponse.of(page.map(this::toResponse));
    }

    @Override
    public TourDetailResponse getDetail(Long id) {
        Tour tour = tourRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour không tồn tại"));
        return toDetail(tour);
    }

    @Override
    public List<TourResponse> featured() {
        return tourRepository.findTop8ByStatusAndFeaturedTrueOrderByAverageRatingDesc(TourStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<TourResponse> newest() {
        return tourRepository.findTop8ByStatusOrderByCreatedAtDesc(TourStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<TourResponse> discounted() {
        return tourRepository.findDiscountedTours().stream()
                .limit(8)
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<TourResponse> topRated() {
        return tourRepository.findTop8ByStatusOrderByAverageRatingDescReviewCountDesc(TourStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public List<TourResponse> related(Long tourId) {
        Tour tour = find(tourId);
        return tourRepository.findTop6ByStatusAndDestinationIdAndIdNot(
                        TourStatus.ACTIVE, tour.getDestination().getId(), tourId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public TourDetailResponse create(TourCreateRequest request) {
        if (tourRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã tour đã tồn tại");
        }
        Tour tour = new Tour();
        apply(tour, request);
        Tour saved = tourRepository.save(tour);
        tourRepository.flush(); // flush để schedules được lưu & ID được generate ngay
        // Auto tạo 3 lịch khởi hành mẫu (cách nhau ~2 tuần) để tour có sẵn ngày cho user đặt
        autoCreateDefaultSchedules(saved);
        return toDetail(saved);
    }

    @Override
    @Transactional
    public TourDetailResponse update(Long id, TourCreateRequest request) {
        Tour tour = find(id);
        if (!tour.getCode().equals(request.getCode()) && tourRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã tour đã tồn tại");
        }
        apply(tour, request);
        return toDetail(tour);
    }

    /**
     * Cập nhật từ {@link TourUpdateRequest} - KHÔNG yêu cầu categoryId/destinationId
     * (giữ nguyên giá trị hiện tại trên tour), đồng thời nhận images & itineraries
     * để đồng bộ với frontend.
     */
    @Override
    @Transactional
    public TourDetailResponse update(Long id, TourUpdateRequest request) {
        Tour tour = find(id);
        applyUpdate(tour, request);
        return toDetail(tour);
    }

    /**
     * Áp dụng các thay đổi từ {@link TourUpdateRequest} mà không ép buộc
     * categoryId/destinationId (giữ nguyên giá trị cũ trên tour).
     */
    private void applyUpdate(Tour tour, TourUpdateRequest request) {
        if (request.getName() != null) {
            tour.setName(request.getName());
        }
        if (request.getDescription() != null) {
            tour.setDescription(request.getDescription());
        }
        if (request.getDurationDays() != null) {
            tour.setDurationDays(request.getDurationDays());
        }
        if (request.getDurationNights() != null) {
            tour.setDurationNights(request.getDurationNights());
        }
        if (request.getOriginalPrice() != null) {
            tour.setOriginalPrice(request.getOriginalPrice());
        }
        if (request.getAdultPrice() != null) {
            tour.setAdultPrice(request.getAdultPrice());
        }
        if (request.getChildPrice() != null) {
            tour.setChildPrice(request.getChildPrice());
        }
        if (request.getInfantPrice() != null) {
            tour.setInfantPrice(request.getInfantPrice());
        } else {
            tour.setInfantPrice(BigDecimal.ZERO);
        }
        if (request.getMaxPeople() != null) {
            tour.setMaxPeople(request.getMaxPeople());
        }
        if (request.getStatus() != null) {
            tour.setStatus(request.getStatus());
        }
        if (request.getFeatured() != null) {
            tour.setFeatured(request.getFeatured());
        }
        // Phương tiện chọn ở cấp tour (null = không thay đổi / đặt thành null nếu gửi rỗng)
        applyTransport(tour, request.getTransportModeId(), request.getDeparturePointId(), request.getAirlineId());

        // Cập nhật ảnh (nếu có trong payload)
        if (request.getImages() != null) {
            tour.getImages().clear();
            int index = 0;
            for (TourImageRequest imageRequest : request.getImages()) {
                TourImage image = TourImage.builder()
                        .tour(tour)
                        .imageUrl(imageRequest.getImageUrl())
                        .cover(Boolean.TRUE.equals(imageRequest.getCover()) || index == 0)
                        .sortOrder(imageRequest.getSortOrder() == null ? index : imageRequest.getSortOrder())
                        .build();
                tour.getImages().add(image);
                index++;
            }
        }

        // Cập nhật lịch trình (nếu có trong payload)
        if (request.getItineraries() != null) {
            tour.getItineraries().clear();
            for (ItineraryRequest itineraryRequest : request.getItineraries()) {
                TourItinerary itinerary = TourItinerary.builder()
                        .tour(tour)
                        .dayNumber(itineraryRequest.getDayNumber())
                        .title(itineraryRequest.getTitle())
                        .description(itineraryRequest.getDescription())
                        .build();
                tour.getItineraries().add(itinerary);
            }
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        tourRepository.delete(find(id));
    }

    @Override
    @Transactional
    public TourDetailResponse changeVisibility(Long id, TourStatus status) {
        Tour tour = find(id);
        tour.setStatus(status);
        return toDetail(tour);
    }

    @Override
    public Tour find(Long id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tour không tồn tại"));
    }

    private void apply(Tour tour, TourCreateRequest request) {
        Category category = categoryService.find(request.getCategoryId());
        Destination destination = destinationService.find(request.getDestinationId());
        tour.setCode(request.getCode());
        tour.setName(request.getName());
        tour.setCategory(category);
        tour.setDestination(destination);
        applyTransport(tour, request.getTransportModeId(), request.getDeparturePointId(), request.getAirlineId());
        tour.setDescription(request.getDescription());
        tour.setDurationDays(request.getDurationDays());
        tour.setDurationNights(request.getDurationNights());
        tour.setOriginalPrice(request.getOriginalPrice());
        tour.setAdultPrice(request.getAdultPrice());
        tour.setChildPrice(request.getChildPrice());
        tour.setInfantPrice(request.getInfantPrice() == null ? BigDecimal.ZERO : request.getInfantPrice());
        tour.setMaxPeople(request.getMaxPeople());
        tour.setStatus(request.getStatus() == null ? TourStatus.ACTIVE : request.getStatus());
        tour.setFeatured(Boolean.TRUE.equals(request.getFeatured()));

        tour.getImages().clear();
        if (request.getImages() != null) {
            int index = 0;
            for (TourImageRequest imageRequest : request.getImages()) {
                TourImage image = TourImage.builder()
                        .tour(tour)
                        .imageUrl(imageRequest.getImageUrl())
                        .cover(Boolean.TRUE.equals(imageRequest.getCover()) || index == 0)
                        .sortOrder(imageRequest.getSortOrder() == null ? index : imageRequest.getSortOrder())
                        .build();
                tour.getImages().add(image);
                index++;
            }
        }

        tour.getItineraries().clear();
        if (request.getItineraries() != null) {
            for (ItineraryRequest itineraryRequest : request.getItineraries()) {
                TourItinerary itinerary = TourItinerary.builder()
                        .tour(tour)
                        .dayNumber(itineraryRequest.getDayNumber())
                        .title(itineraryRequest.getTitle())
                        .description(itineraryRequest.getDescription())
                        .build();
                tour.getItineraries().add(itinerary);
            }
        }
    }

    @Override
    public TourResponse toResponse(Tour tour) {
        return TourResponse.builder()
                .id(tour.getId())
                .code(tour.getCode())
                .name(tour.getName())
                .coverImage(tour.coverImage())
                .destinationName(tour.getDestination() != null ? tour.getDestination().getName() : null)
                .categoryName(tour.getCategory() != null ? tour.getCategory().getName() : null)
                .transportModeName(tour.getTransportMode() != null ? tour.getTransportMode().getName() : null)
                .transportModeIcon(tour.getTransportMode() != null ? tour.getTransportMode().getIcon() : null)
                .originalPrice(tour.getOriginalPrice())
                .adultPrice(tour.getAdultPrice())
                .childPrice(tour.getChildPrice())
                .averageRating(tour.getAverageRating())
                .reviewCount(tour.getReviewCount())
                .durationDays(tour.getDurationDays())
                .featured(tour.getFeatured())
                .status(tour.getStatus())
                .build();
    }

    @Override
    public TourDetailResponse toDetail(Tour tour) {
        return TourDetailResponse.builder()
                .id(tour.getId())
                .code(tour.getCode())
                .name(tour.getName())
                .description(tour.getDescription())
                .categoryId(tour.getCategory() != null ? tour.getCategory().getId() : null)
                .categoryName(tour.getCategory() != null ? tour.getCategory().getName() : null)
                .destinationId(tour.getDestination() != null ? tour.getDestination().getId() : null)
                .destinationName(tour.getDestination() != null ? tour.getDestination().getName() : null)
                .transportModeId(tour.getTransportMode() != null ? tour.getTransportMode().getId() : null)
                .transportModeName(tour.getTransportMode() != null ? tour.getTransportMode().getName() : null)
                .departurePointId(tour.getDeparturePoint() != null ? tour.getDeparturePoint().getId() : null)
                .departurePointName(tour.getDeparturePoint() != null ? tour.getDeparturePoint().getName() : null)
                .airlineId(tour.getAirline() != null ? tour.getAirline().getId() : null)
                .airlineName(tour.getAirline() != null ? tour.getAirline().getName() : null)
                .durationDays(tour.getDurationDays())
                .durationNights(tour.getDurationNights())
                .originalPrice(tour.getOriginalPrice())
                .adultPrice(tour.getAdultPrice())
                .childPrice(tour.getChildPrice())
                .infantPrice(tour.getInfantPrice())
                .maxPeople(tour.getMaxPeople())
                .averageRating(tour.getAverageRating())
                .reviewCount(tour.getReviewCount())
                .status(tour.getStatus() != null ? tour.getStatus().name() : null)
                .featured(tour.getFeatured())
                .images(tour.getImages().stream().map(TourImage::getImageUrl).toList())
                .itineraries(tour.getItineraries().stream().map(it -> com.travelgo.dto.tour.ItineraryResponse.builder()
                        .id(it.getId())
                        .dayNumber(it.getDayNumber())
                        .title(it.getTitle())
                        .description(it.getDescription())
                        .build()).toList())
                .departureDates(tour.getSchedules().stream()
                        .map(s -> s.getDepartureDate())
                        .distinct()
                        .sorted()
                        .toList())
                .transports(buildTransportSummaries(tour))
                .build();
    }

    /**
     * Gán phương tiện ở cấp tour. Giá trị null sẽ đặt thành null (cho phép admin
     * bỏ phương tiện), đồng thời đồng bộ xuống các lịch khởi hành đang có để dữ liệu
     * lịch không bị "mồ côi" phương tiện.
     */
    private void applyTransport(Tour tour, Long transportModeId, Long departurePointId, Long airlineId) {
        TransportMode mode = transportModeId != null ? transportModeRepository.findById(transportModeId).orElse(null) : null;
        DeparturePoint point = departurePointId != null ? departurePointRepository.findById(departurePointId).orElse(null) : null;
        Airline airline = airlineId != null ? airlineRepository.findById(airlineId).orElse(null) : null;
        if (transportModeId != null && mode == null) {
            throw new BadRequestException("Phương tiện không tồn tại");
        }
        if (departurePointId != null && point == null) {
            throw new BadRequestException("Điểm khởi hành không tồn tại");
        }
        if (airlineId != null && airline == null) {
            throw new BadRequestException("Hãng bay không tồn tại");
        }
        tour.setTransportMode(mode);
        tour.setDeparturePoint(point);
        tour.setAirline(airline);
        // Đồng bộ xuống lịch: lịch chưa có phương tiện riêng thì kế thừa từ tour
        for (TourSchedule schedule : tour.getSchedules()) {
            if (schedule.getTransportMode() == null) {
                schedule.setTransportMode(mode);
                schedule.setDeparturePoint(point);
                schedule.setAirline(airline);
            }
        }
    }

    /**
     * Gộp phương tiện từ các lịch khởi hành của tour, loại trùng theo
     * (phương tiện, điểm khởi hành, hãng bay) và giữ thứ tự ổn định.
     * Nếu lịch chưa gán riêng thì kế thừa từ cấp tour.
     */
    private List<TourDetailResponse.TransportSummary> buildTransportSummaries(Tour tour) {
        Map<String, TourDetailResponse.TransportSummary> unique = new LinkedHashMap<>();
        // Ưu tiên phương tiện cấp tour làm "mặc định" khi tour chưa có lịch nào gán riêng
        addTransportSummary(unique, tour.getTransportMode(), tour.getDeparturePoint(), tour.getAirline());
        for (TourSchedule schedule : tour.getSchedules()) {
            // Lịch chưa gán riêng → kế thừa từ tour; đã gán riêng → giữ nguyên
            if (schedule.getTransportMode() == null) {
                addTransportSummary(unique, tour.getTransportMode(), tour.getDeparturePoint(), tour.getAirline());
            } else {
                addTransportSummary(unique, schedule.getTransportMode(), schedule.getDeparturePoint(), schedule.getAirline());
            }
        }
        return List.copyOf(unique.values());
    }

    private void addTransportSummary(Map<String, TourDetailResponse.TransportSummary> unique,
                                    TransportMode mode, DeparturePoint point, Airline airline) {
        if (mode == null) {
            return;
        }
        String key = mode.getId() + "|" + (point != null ? point.getId() : 0) + "|"
                + (airline != null ? airline.getId() : 0);
        unique.putIfAbsent(key, TourDetailResponse.TransportSummary.builder()
                .transportModeId(mode.getId())
                .transportModeName(mode.getName())
                .transportModeIcon(mode.getIcon())
                .departurePointId(point != null ? point.getId() : null)
                .departurePointName(point != null ? point.getName() : null)
                .airlineId(airline != null ? airline.getId() : null)
                .airlineName(airline != null ? airline.getName() : null)
                .airlineCode(airline != null ? airline.getCode() : null)
                .build());
    }

    /**
     * Auto tạo 3 lịch khởi hành mẫu cho tour mới:
     *   - Lịch 1: sau 14 ngày
     *   - Lịch 2: sau 28 ngày
     *   - Lịch 3: sau 42 ngày
     * Mỗi lịch có số chỗ = maxPeople của tour, status = OPEN.
     * Admin có thể sửa/xóa lịch trong form quản lý tour sau.
     */
    private void autoCreateDefaultSchedules(Tour tour) {
        int durationDays = tour.getDurationDays() != null ? tour.getDurationDays() : 1;
        int totalSeats = tour.getMaxPeople() != null ? tour.getMaxPeople() : 30;
        LocalDate today = LocalDate.now();
        for (int offsetDays : new int[]{14, 28, 42}) {
            LocalDate departure = today.plusDays(offsetDays);
            TourSchedule schedule = TourSchedule.builder()
                    .tour(tour)
                    .departureDate(departure)
                    .returnDate(departure.plusDays(durationDays - 1L))
                    .totalSeats(totalSeats)
                    .availableSeats(totalSeats)
                    .status(ScheduleStatus.OPEN)
                    // Kế thừa phương tiện chọn ở cấp tour
                    .transportMode(tour.getTransportMode())
                    .departurePoint(tour.getDeparturePoint())
                    .airline(tour.getAirline())
                    .build();
            // Add vào collection của tour → JPA sẽ cascade persist khi flush
            tour.getSchedules().add(schedule);
        }
        // Flush để ID được generate và schedules được lưu cùng transaction
        scheduleRepository.flush();
    }
}
