package com.travelgo.service.airline;

import com.travelgo.dto.airline.AirlineRequest;
import com.travelgo.dto.airline.AirlineResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AirlineService {
    List<AirlineResponse> findActive();
    Page<AirlineResponse> search(String keyword, Pageable pageable);
    AirlineResponse get(Long id);
    AirlineResponse create(AirlineRequest request);
    AirlineResponse update(Long id, AirlineRequest request);
    void delete(Long id);
}
