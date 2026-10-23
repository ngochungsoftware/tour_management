package com.travelgo.service.transport.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.transport.TransportModeRequest;
import com.travelgo.dto.transport.TransportModeResponse;
import com.travelgo.entity.TransportMode;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.TransportModeRepository;
import com.travelgo.service.transport.TransportModeService;
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
public class TransportModeServiceImpl implements TransportModeService {

    private final TransportModeRepository repo;

    @Override
    public List<TransportModeResponse> findActive() {
        return repo.findByStatus(ActiveStatus.ACTIVE).stream().map(this::toResponse).toList();
    }

    @Override
    public Page<TransportModeResponse> search(String keyword, Pageable pageable) {
        Specification<TransportMode> spec = (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), like);
        };
        return repo.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public TransportModeResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public TransportModeResponse create(TransportModeRequest request) {
        repo.findByNameIgnoreCase(request.getName()).ifPresent(p -> {
            throw new BadRequestException("Phương tiện đã tồn tại");
        });
        TransportMode t = TransportMode.builder()
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(repo.save(t));
    }

    @Override
    @Transactional
    public TransportModeResponse update(Long id, TransportModeRequest request) {
        TransportMode t = find(id);
        repo.findByNameIgnoreCase(request.getName())
                .filter(o -> !o.getId().equals(id))
                .ifPresent(o -> { throw new BadRequestException("Phương tiện đã tồn tại"); });
        t.setName(request.getName());
        t.setDescription(request.getDescription());
        t.setIcon(request.getIcon());
        if (request.getStatus() != null) t.setStatus(request.getStatus());
        return toResponse(t);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private TransportMode find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Phương tiện không tồn tại"));
    }

    private TransportModeResponse toResponse(TransportMode t) {
        return TransportModeResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .description(t.getDescription())
                .icon(t.getIcon())
                .status(t.getStatus())
                .build();
    }
}
