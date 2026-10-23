package com.travelgo.service.attraction.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.attraction.AttractionRequest;
import com.travelgo.dto.attraction.AttractionResponse;
import com.travelgo.entity.Attraction;
import com.travelgo.entity.Destination;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.AttractionRepository;
import com.travelgo.repository.DestinationRepository;
import com.travelgo.service.attraction.AttractionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttractionServiceImpl implements AttractionService {

    private final AttractionRepository attractionRepository;
    private final DestinationRepository destinationRepository;

    @Override
    public List<AttractionResponse> findActive() {
        return attractionRepository.findByStatus(ActiveStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<AttractionResponse> findByDestination(Long destinationId) {
        return attractionRepository.findByDestination_Id(destinationId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Page<AttractionResponse> search(String keyword, Long destinationId, Pageable pageable) {
        Specification<Attraction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("address")), like)
                ));
            }
            if (destinationId != null) {
                predicates.add(cb.equal(root.get("destination").get("id"), destinationId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return attractionRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public AttractionResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public AttractionResponse create(AttractionRequest request) {
        Destination dest = destinationRepository.findById(request.getDestinationId())
                .orElseThrow(() -> new ResourceNotFoundException("Điểm đến không tồn tại"));
        Attraction a = Attraction.builder()
                .name(request.getName())
                .destination(dest)
                .description(request.getDescription())
                .image(request.getImage())
                .address(request.getAddress())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(attractionRepository.save(a));
    }

    @Override
    @Transactional
    public AttractionResponse update(Long id, AttractionRequest request) {
        Attraction a = find(id);
        if (!a.getDestination().getId().equals(request.getDestinationId())) {
            Destination dest = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Điểm đến không tồn tại"));
            a.setDestination(dest);
        }
        a.setName(request.getName());
        a.setDescription(request.getDescription());
        a.setImage(request.getImage());
        a.setAddress(request.getAddress());
        if (request.getStatus() != null) a.setStatus(request.getStatus());
        return toResponse(a);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        attractionRepository.delete(find(id));
    }

    private Attraction find(Long id) {
        return attractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Điểm tham quan không tồn tại"));
    }

    private AttractionResponse toResponse(Attraction a) {
        return AttractionResponse.builder()
                .id(a.getId())
                .name(a.getName())
                .destinationId(a.getDestination() != null ? a.getDestination().getId() : null)
                .destinationName(a.getDestination() != null ? a.getDestination().getName() : null)
                .description(a.getDescription())
                .image(a.getImage())
                .address(a.getAddress())
                .status(a.getStatus())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
