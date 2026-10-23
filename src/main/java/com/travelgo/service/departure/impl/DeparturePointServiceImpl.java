package com.travelgo.service.departure.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.departure.DeparturePointRequest;
import com.travelgo.dto.departure.DeparturePointResponse;
import com.travelgo.entity.DeparturePoint;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.DeparturePointRepository;
import com.travelgo.service.departure.DeparturePointService;
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
public class DeparturePointServiceImpl implements DeparturePointService {

    private final DeparturePointRepository repo;

    @Override
    public List<DeparturePointResponse> findActive() {
        return repo.findByStatus(ActiveStatus.ACTIVE).stream().map(this::toResponse).toList();
    }

    @Override
    public List<DeparturePointResponse> findByCity(String city) {
        return repo.findByCityIgnoreCase(city).stream().map(this::toResponse).toList();
    }

    @Override
    public Page<DeparturePointResponse> search(String keyword, Pageable pageable) {
        Specification<DeparturePoint> spec = (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("city")), like)
            );
        };
        return repo.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public DeparturePointResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public DeparturePointResponse create(DeparturePointRequest request) {
        repo.findByNameIgnoreCase(request.getName()).ifPresent(p -> {
            throw new BadRequestException("Điểm khởi hành đã tồn tại");
        });
        DeparturePoint p = DeparturePoint.builder()
                .name(request.getName())
                .city(request.getCity())
                .address(request.getAddress())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(repo.save(p));
    }

    @Override
    @Transactional
    public DeparturePointResponse update(Long id, DeparturePointRequest request) {
        DeparturePoint p = find(id);
        repo.findByNameIgnoreCase(request.getName())
                .filter(o -> !o.getId().equals(id))
                .ifPresent(o -> { throw new BadRequestException("Điểm khởi hành đã tồn tại"); });
        p.setName(request.getName());
        p.setCity(request.getCity());
        p.setAddress(request.getAddress());
        if (request.getStatus() != null) p.setStatus(request.getStatus());
        return toResponse(p);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private DeparturePoint find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Điểm khởi hành không tồn tại"));
    }

    private DeparturePointResponse toResponse(DeparturePoint p) {
        return DeparturePointResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .city(p.getCity())
                .address(p.getAddress())
                .status(p.getStatus())
                .build();
    }
}
