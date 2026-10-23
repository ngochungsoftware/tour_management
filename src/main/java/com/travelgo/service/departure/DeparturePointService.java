package com.travelgo.service.departure;

import com.travelgo.dto.departure.DeparturePointRequest;
import com.travelgo.dto.departure.DeparturePointResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DeparturePointService {
    List<DeparturePointResponse> findActive();
    List<DeparturePointResponse> findByCity(String city);
    Page<DeparturePointResponse> search(String keyword, Pageable pageable);
    DeparturePointResponse get(Long id);
    DeparturePointResponse create(DeparturePointRequest request);
    DeparturePointResponse update(Long id, DeparturePointRequest request);
    void delete(Long id);
}
