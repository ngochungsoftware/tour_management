package com.travelgo.service.attraction;

import com.travelgo.dto.attraction.AttractionRequest;
import com.travelgo.dto.attraction.AttractionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AttractionService {
    List<AttractionResponse> findActive();
    List<AttractionResponse> findByDestination(Long destinationId);
    Page<AttractionResponse> search(String keyword, Long destinationId, Pageable pageable);
    AttractionResponse get(Long id);
    AttractionResponse create(AttractionRequest request);
    AttractionResponse update(Long id, AttractionRequest request);
    void delete(Long id);
}
