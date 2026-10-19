package com.travelgo.service.schedule.impl;

import com.travelgo.common.enums.ScheduleStatus;
import com.travelgo.dto.schedule.ScheduleRequest;
import com.travelgo.dto.schedule.ScheduleResponse;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourSchedule;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.service.schedule.ScheduleService;
import com.travelgo.service.tour.TourService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourService tourService;

    public ScheduleServiceImpl(TourScheduleRepository scheduleRepository, TourService tourService) {
        this.scheduleRepository = scheduleRepository;
        this.tourService = tourService;
    }

    @Override
    public List<ScheduleResponse> findByTour(Long tourId) {
        return scheduleRepository.findByTourIdOrderByDepartureDateAsc(tourId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ScheduleResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        if (request.getReturnDate().isBefore(request.getDepartureDate())) {
            throw new BadRequestException("Ngày về phải sau ngày khởi hành");
        }
        Tour tour = tourService.find(request.getTourId());
        TourSchedule schedule = TourSchedule.builder()
                .tour(tour)
                .departureDate(request.getDepartureDate())
                .returnDate(request.getReturnDate())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .status(request.getStatus() == null ? ScheduleStatus.OPEN : request.getStatus())
                .build();
        return toResponse(scheduleRepository.save(schedule));
    }

    @Override
    @Transactional
    public ScheduleResponse update(Long id, ScheduleRequest request) {
        TourSchedule schedule = find(id);
        int booked = schedule.getTotalSeats() - schedule.getAvailableSeats();
        if (request.getTotalSeats() < booked) {
            throw new BadRequestException("Tổng số chỗ không được nhỏ hơn số chỗ đã đặt");
        }
        schedule.setDepartureDate(request.getDepartureDate());
        schedule.setReturnDate(request.getReturnDate());
        schedule.setAvailableSeats(schedule.getAvailableSeats() + (request.getTotalSeats() - schedule.getTotalSeats()));
        schedule.setTotalSeats(request.getTotalSeats());
        if (request.getStatus() != null) {
            schedule.setStatus(request.getStatus());
        }
        return toResponse(schedule);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        TourSchedule schedule = find(id);
        if (!schedule.getAvailableSeats().equals(schedule.getTotalSeats())) {
            throw new BadRequestException("Không thể xóa lịch đã có người đặt");
        }
        scheduleRepository.delete(schedule);
    }

    @Override
    public TourSchedule find(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lịch khởi hành không tồn tại"));
    }

    private ScheduleResponse toResponse(TourSchedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .tourId(schedule.getTour() != null ? schedule.getTour().getId() : null)
                .tourName(schedule.getTour() != null ? schedule.getTour().getName() : null)
                .departureDate(schedule.getDepartureDate())
                .returnDate(schedule.getReturnDate())
                .totalSeats(schedule.getTotalSeats())
                .availableSeats(schedule.getAvailableSeats())
                .status(schedule.getStatus())
                .build();
    }
}
