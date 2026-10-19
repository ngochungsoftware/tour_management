package com.travelgo.controller;

import com.travelgo.dto.destination.DestinationResponse;
import com.travelgo.service.destination.DestinationService;
import com.travelgo.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
public class DestinationController {

    private final DestinationService destinationService;

    public DestinationController(DestinationService destinationService) {
        this.destinationService = destinationService;
    }

    @GetMapping
    public ApiResponse<List<DestinationResponse>> list() {
        return ApiResponse.ok(destinationService.findActive());
    }

    @GetMapping("/{id}")
    public ApiResponse<DestinationResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(destinationService.get(id));
    }
}
