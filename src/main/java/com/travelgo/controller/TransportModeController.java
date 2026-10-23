package com.travelgo.controller;

import com.travelgo.dto.transport.TransportModeResponse;
import com.travelgo.service.transport.TransportModeService;
import com.travelgo.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transport-modes")
@RequiredArgsConstructor
public class TransportModeController {

    private final TransportModeService service;

    @GetMapping
    public ApiResponse<List<TransportModeResponse>> list() {
        return ApiResponse.ok(service.findActive());
    }
}
