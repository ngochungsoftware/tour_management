package com.travelgo.controller;

import com.travelgo.dto.schedule.ScheduleResponse;
import com.travelgo.service.schedule.ScheduleService;
import com.travelgo.util.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ApiResponse<List<ScheduleResponse>> byTour(@RequestParam Long tourId) {
        return ApiResponse.ok(scheduleService.findByTour(tourId));
    }
}
