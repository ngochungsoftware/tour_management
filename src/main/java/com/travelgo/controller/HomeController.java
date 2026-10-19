package com.travelgo.controller;

import com.travelgo.service.home.HomeService;
import com.travelgo.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/home")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping
    public ApiResponse<Map<String, Object>> home() {
        return ApiResponse.ok(homeService.home());
    }
}
