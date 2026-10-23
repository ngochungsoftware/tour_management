package com.travelgo.controller;

import com.travelgo.common.enums.BannerPosition;
import com.travelgo.dto.banner.BannerResponse;
import com.travelgo.service.banner.BannerService;
import com.travelgo.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService service;

    @GetMapping
    public ApiResponse<List<BannerResponse>> list(@RequestParam(required = false) BannerPosition position) {
        if (position != null) {
            return ApiResponse.ok(service.findActiveByPosition(position));
        }
        return ApiResponse.ok(service.findActiveByPosition(BannerPosition.HOME_HERO));
    }
}
