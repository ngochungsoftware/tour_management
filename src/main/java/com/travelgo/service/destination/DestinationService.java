package com.travelgo.service.destination;

import com.travelgo.dto.destination.DestinationRequest;
import com.travelgo.dto.destination.DestinationResponse;
import com.travelgo.entity.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DestinationService {
    List<DestinationResponse> findActive();
    Page<DestinationResponse> search(String keyword, Pageable pageable);
    DestinationResponse get(Long id);
    DestinationResponse create(DestinationRequest request);
    DestinationResponse update(Long id, DestinationRequest request);
    void delete(Long id);
    Destination find(Long id);
}
