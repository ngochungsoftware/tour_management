package com.travelgo.service.tour;

import com.travelgo.common.enums.TourStatus;
import com.travelgo.dto.tour.TourCreateRequest;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.entity.Tour;
import com.travelgo.exception.BadRequestException;
import com.travelgo.repository.TourRepository;
import com.travelgo.service.category.CategoryService;
import com.travelgo.service.destination.DestinationService;
import com.travelgo.service.tour.impl.TourServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TourServiceTest {

    @Mock private TourRepository tourRepository;
    @Mock private CategoryService categoryService;
    @Mock private DestinationService destinationService;
    @InjectMocks private TourServiceImpl tourService;

    @Test
    void searchReturnsPage() {
        Tour tour = Tour.builder().id(1L).name("Đà Nẵng").status(TourStatus.ACTIVE)
                .adultPrice(BigDecimal.valueOf(4590000))
                .childPrice(BigDecimal.valueOf(3200000))
                .build();
        when(tourRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(tour)));

        var result = tourService.search("Đà Nẵng", null, null, null, null, null, null, TourStatus.ACTIVE, PageRequest.of(0, 10));
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Đà Nẵng");
    }

    @Test
    void createDuplicateCode() {
        TourCreateRequest request = TourCreateRequest.builder()
                .code("TG001")
                .name("Tour")
                .categoryId(1L)
                .destinationId(1L)
                .durationDays(3)
                .durationNights(2)
                .adultPrice(BigDecimal.TEN)
                .childPrice(BigDecimal.ONE)
                .maxPeople(10)
                .build();
        when(tourRepository.existsByCode("TG001")).thenReturn(true);

        assertThatThrownBy(() -> tourService.create(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Mã tour đã tồn tại");
    }
}
