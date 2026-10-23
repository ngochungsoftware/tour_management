package com.travelgo.service.transport;

import com.travelgo.dto.transport.TransportModeRequest;
import com.travelgo.dto.transport.TransportModeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TransportModeService {
    List<TransportModeResponse> findActive();
    Page<TransportModeResponse> search(String keyword, Pageable pageable);
    TransportModeResponse get(Long id);
    TransportModeResponse create(TransportModeRequest request);
    TransportModeResponse update(Long id, TransportModeRequest request);
    void delete(Long id);
}
