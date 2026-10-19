package com.travelgo.service.tour.impl;

import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.tour.ItineraryRequest;
import com.travelgo.dto.tour.TourCreateRequest;
import com.travelgo.dto.tour.TourDetailResponse;
import com.travelgo.dto.tour.TourImageRequest;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.entity.Category;
import com.travelgo.entity.Destination;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourImage;
import com.travelgo.entity.TourItinerary;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.TourRepository;
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
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TourServiceImpl implements TourService {

    private final TourRepository tourRepository;
    private final CategoryService categoryService;
    private final DestinationService destinationService;

    public TourServiceImpl(TourRepository tourRepository,
                           CategoryService categoryService,
                           DestinationService destinationService) {
        this.tourRepository = tourRepository;
        this.categoryService = categoryService;
        this.destinationService = destinationService;
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
        return toDetail(tourRepository.save(tour));
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
                .originalPrice(tour.getOriginalPrice())
                .adultPrice(tour.getAdultPrice())
                .childPrice(tour.getChildPrice())
                .averageRating(tour.getAverageRating())
                .reviewCount(tour.getReviewCount())
                .durationDays(tour.getDurationDays())
                .featured(tour.getFeatured())
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
                .build();
    }
}
