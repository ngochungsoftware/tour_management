package com.travelgo.service.tour;

import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.tour.TourCreateRequest;
import com.travelgo.dto.tour.TourDetailResponse;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.entity.Tour;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TourService {
    PageResponse<TourResponse> search(String keyword,
                                      Long categoryId,
                                      Long destinationId,
                                      BigDecimal minPrice,
                                      BigDecimal maxPrice,
                                      Integer durationDays,
                                      LocalDate departureDate,
                                      TourStatus status,
                                      Boolean featured,
                                      Boolean discount,
                                      Pageable pageable);
    TourDetailResponse getDetail(Long id);
    List<TourResponse> featured();
    List<TourResponse> newest();
    List<TourResponse> discounted();
    List<TourResponse> topRated();
    List<TourResponse> related(Long tourId);
    TourDetailResponse create(TourCreateRequest request);
    TourDetailResponse update(Long id, TourCreateRequest request);
    void delete(Long id);
    TourDetailResponse changeVisibility(Long id, TourStatus status);
    Tour find(Long id);
    TourResponse toResponse(Tour tour);
    TourDetailResponse toDetail(Tour tour);
}
