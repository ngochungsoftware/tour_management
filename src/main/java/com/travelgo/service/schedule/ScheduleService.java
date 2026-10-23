package com.travelgo.service.schedule;

import com.travelgo.dto.schedule.ScheduleRequest;
import com.travelgo.dto.schedule.ScheduleResponse;
import com.travelgo.entity.TourSchedule;

import java.util.List;

public interface ScheduleService {
    List<ScheduleResponse> findByTour(Long tourId);
    List<ScheduleResponse> findAll();
    ScheduleResponse get(Long id);
    ScheduleResponse create(ScheduleRequest request);
    ScheduleResponse update(Long id, ScheduleRequest request);
    void delete(Long id);
    TourSchedule find(Long id);
}
