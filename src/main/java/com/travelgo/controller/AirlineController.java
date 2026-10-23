package com.travelgo.controller;

import com.travelgo.dto.airline.AirlineResponse;
import com.travelgo.service.airline.AirlineService;
import com.travelgo.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/airlines")
@RequiredArgsConstructor
public class AirlineController {

    private final AirlineService service;

    @GetMapping
    public ApiResponse<List<AirlineResponse>> list() {
        return ApiResponse.ok(service.findActive());
    }

    @GetMapping("/{id}")
    public ApiResponse<AirlineResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(service.get(id));
    }
}
