package com.travelgo.controller;

import com.travelgo.dto.attraction.AttractionResponse;
import com.travelgo.service.attraction.AttractionService;
import com.travelgo.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attractions")
@RequiredArgsConstructor
public class AttractionController {

    private final AttractionService attractionService;

    @GetMapping
    public ApiResponse<List<AttractionResponse>> list(@RequestParam(required = false) Long destinationId) {
        if (destinationId != null) {
            return ApiResponse.ok(attractionService.findByDestination(destinationId));
        }
        return ApiResponse.ok(attractionService.findActive());
    }

    @GetMapping("/{id}")
    public ApiResponse<AttractionResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(attractionService.get(id));
    }
}
