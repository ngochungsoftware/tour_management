package com.travelgo.controller;

import com.travelgo.dto.departure.DeparturePointResponse;
import com.travelgo.service.departure.DeparturePointService;
import com.travelgo.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departure-points")
@RequiredArgsConstructor
public class DeparturePointController {

    private final DeparturePointService service;

    @GetMapping
    public ApiResponse<List<DeparturePointResponse>> list(@RequestParam(required = false) String city) {
        if (city != null && !city.isBlank()) {
            return ApiResponse.ok(service.findByCity(city));
        }
        return ApiResponse.ok(service.findActive());
    }

    @GetMapping("/{id}")
    public ApiResponse<DeparturePointResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(service.get(id));
    }
}
