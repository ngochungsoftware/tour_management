package com.travelgo.service.home.impl;

import com.travelgo.dto.category.CategoryResponse;
import com.travelgo.dto.destination.DestinationResponse;
import com.travelgo.dto.tour.TourResponse;
import com.travelgo.service.category.CategoryService;
import com.travelgo.service.destination.DestinationService;
import com.travelgo.service.home.HomeService;
import com.travelgo.service.tour.TourService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class HomeServiceImpl implements HomeService {

    private final TourService tourService;
    private final CategoryService categoryService;
    private final DestinationService destinationService;

    public HomeServiceImpl(TourService tourService,
                           CategoryService categoryService,
                           DestinationService destinationService) {
        this.tourService = tourService;
        this.categoryService = categoryService;
        this.destinationService = destinationService;
    }

    @Override
    public Map<String, Object> home() {
        List<TourResponse> featured = tourService.featured();
        List<TourResponse> newest = tourService.newest();
        List<TourResponse> discounted = tourService.discounted();
        List<TourResponse> topRated = tourService.topRated();
        List<DestinationResponse> destinations = destinationService.findActive();
        List<CategoryResponse> categories = categoryService.findActive();
        return Map.of(
                "featuredTours", featured,
                "newTours", newest,
                "discountedTours", discounted,
                "topRatedTours", topRated,
                "popularDestinations", destinations,
                "categories", categories
        );
    }
}
