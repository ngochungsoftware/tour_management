package com.travelgo.service.schedule.impl;

import com.travelgo.common.enums.ScheduleStatus;
import com.travelgo.dto.schedule.ScheduleRequest;
import com.travelgo.dto.schedule.ScheduleResponse;
import com.travelgo.entity.Airline;
import com.travelgo.entity.DeparturePoint;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourSchedule;
import com.travelgo.entity.TransportMode;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.AirlineRepository;
import com.travelgo.repository.DeparturePointRepository;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.repository.TransportModeRepository;
import com.travelgo.service.schedule.ScheduleService;
import com.travelgo.service.tour.TourService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final TourScheduleRepository scheduleRepository;
    private final TourService tourService;
    private final DeparturePointRepository departurePointRepository;
    private final TransportModeRepository transportModeRepository;
    private final AirlineRepository airlineRepository;

    public ScheduleServiceImpl(TourScheduleRepository scheduleRepository,
                               TourService tourService,
                               DeparturePointRepository departurePointRepository,
                               TransportModeRepository transportModeRepository,
                               AirlineRepository airlineRepository) {
        this.scheduleRepository = scheduleRepository;
        this.tourService = tourService;
        this.departurePointRepository = departurePointRepository;
        this.transportModeRepository = transportModeRepository;
        this.airlineRepository = airlineRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> findByTour(Long tourId) {
        return scheduleRepository.findByTourIdOrderByDepartureDateAsc(tourId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> findAll() {
        return scheduleRepository.findAllByOrderByDepartureDateAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
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
                .departurePoint(findDeparturePoint(request.getDeparturePointId()))
                .transportMode(findTransportMode(request.getTransportModeId()))
                .airline(findAirline(request.getAirlineId()))
                .adultPrice(request.getAdultPrice())
                .childPrice(request.getChildPrice())
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
        if (request.getDeparturePointId() != null) {
            schedule.setDeparturePoint(findDeparturePoint(request.getDeparturePointId()));
        }
        // Hãng bay chỉ dùng khi phương tiện là máy bay
        TransportMode newMode = null;
        if (request.getTransportModeId() != null) {
            newMode = findTransportMode(request.getTransportModeId());
            schedule.setTransportMode(newMode);
        }
        if (request.getAirlineId() != null) {
            schedule.setAirline(findAirline(request.getAirlineId()));
        } else if (Boolean.TRUE.equals(request.getClearAirline())
                || (newMode != null && !isAirTransport(newMode))) {
            schedule.setAirline(null);
        }
        schedule.setAdultPrice(request.getAdultPrice());
        schedule.setChildPrice(request.getChildPrice());
        return toResponse(schedule);
    }

    private boolean isAirTransport(TransportMode mode) {
        return mode.getIcon() != null && mode.getIcon().toLowerCase().contains("plane");
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
        TransportMode mode = schedule.getTransportMode();
        DeparturePoint point = schedule.getDeparturePoint();
        Airline airline = schedule.getAirline();
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .tourId(schedule.getTour() != null ? schedule.getTour().getId() : null)
                .tourName(schedule.getTour() != null ? schedule.getTour().getName() : null)
                .departureDate(schedule.getDepartureDate())
                .returnDate(schedule.getReturnDate())
                .totalSeats(schedule.getTotalSeats())
                .availableSeats(schedule.getAvailableSeats())
                .status(schedule.getStatus())
                .departurePointId(point != null ? point.getId() : null)
                .departurePointName(point != null ? point.getName() : null)
                .transportModeId(mode != null ? mode.getId() : null)
                .transportModeName(mode != null ? mode.getName() : null)
                .transportModeIcon(mode != null ? mode.getIcon() : null)
                .airlineId(airline != null ? airline.getId() : null)
                .airlineName(airline != null ? airline.getName() : null)
                .airlineCode(airline != null ? airline.getCode() : null)
                .adultPrice(schedule.getAdultPrice())
                .childPrice(schedule.getChildPrice())
                .build();
    }

    // ============== Helper ==============

    private DeparturePoint findDeparturePoint(Long id) {
        if (id == null) return null;
        return departurePointRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Điểm khởi hành không tồn tại"));
    }

    private TransportMode findTransportMode(Long id) {
        if (id == null) return null;
        return transportModeRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Phương tiện di chuyển không tồn tại"));
    }

    private Airline findAirline(Long id) {
        if (id == null) return null;
        return airlineRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Hãng hàng không không tồn tại"));
    }
}
