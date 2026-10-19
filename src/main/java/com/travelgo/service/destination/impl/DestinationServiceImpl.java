package com.travelgo.service.destination.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.destination.DestinationRequest;
import com.travelgo.dto.destination.DestinationResponse;
import com.travelgo.entity.Destination;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.DestinationRepository;
import com.travelgo.service.destination.DestinationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;

    public DestinationServiceImpl(DestinationRepository destinationRepository) {
        this.destinationRepository = destinationRepository;
    }

    @Override
    public List<DestinationResponse> findActive() {
        return destinationRepository.findByStatus(ActiveStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Page<DestinationResponse> search(String keyword, Pageable pageable) {
        Specification<Destination> spec = (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("province")), like)
            );
        };
        return destinationRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public DestinationResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public DestinationResponse create(DestinationRequest request) {
        Destination destination = Destination.builder()
                .name(request.getName())
                .province(request.getProvince())
                .description(request.getDescription())
                .image(request.getImage())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(destinationRepository.save(destination));
    }

    @Override
    @Transactional
    public DestinationResponse update(Long id, DestinationRequest request) {
        Destination destination = find(id);
        destination.setName(request.getName());
        destination.setProvince(request.getProvince());
        destination.setDescription(request.getDescription());
        destination.setImage(request.getImage());
        if (request.getStatus() != null) {
            destination.setStatus(request.getStatus());
        }
        return toResponse(destination);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        destinationRepository.delete(find(id));
    }

    @Override
    public Destination find(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Điểm đến không tồn tại"));
    }

    private DestinationResponse toResponse(Destination destination) {
        return DestinationResponse.builder()
                .id(destination.getId())
                .name(destination.getName())
                .province(destination.getProvince())
                .description(destination.getDescription())
                .image(destination.getImage())
                .status(destination.getStatus())
                .build();
    }
}
