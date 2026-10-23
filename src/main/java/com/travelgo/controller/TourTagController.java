package com.travelgo.controller;

import com.travelgo.dto.tourtag.TourTagResponse;
import com.travelgo.service.tourtag.TourTagService;
import com.travelgo.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tour-tags")
@RequiredArgsConstructor
public class TourTagController {

    private final TourTagService tourTagService;

    @GetMapping
    public ApiResponse<List<TourTagResponse>> list() {
        return ApiResponse.ok(tourTagService.findActive());
    }
}
