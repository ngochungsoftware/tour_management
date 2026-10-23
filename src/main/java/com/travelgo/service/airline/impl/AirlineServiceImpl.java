package com.travelgo.service.airline.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.airline.AirlineRequest;
import com.travelgo.dto.airline.AirlineResponse;
import com.travelgo.entity.Airline;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.AirlineRepository;
import com.travelgo.service.airline.AirlineService;
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
public class AirlineServiceImpl implements AirlineService {

    private final AirlineRepository repo;

    @Override
    public List<AirlineResponse> findActive() {
        return repo.findByStatus(ActiveStatus.ACTIVE).stream().map(this::toResponse).toList();
    }

    @Override
    public Page<AirlineResponse> search(String keyword, Pageable pageable) {
        Specification<Airline> spec = (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), like),
                    cb.like(cb.lower(root.get("name")), like)
            );
        };
        return repo.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public AirlineResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public AirlineResponse create(AirlineRequest request) {
        repo.findByCodeIgnoreCase(request.getCode()).ifPresent(p -> {
            throw new BadRequestException("Mã hãng đã tồn tại");
        });
        repo.findByNameIgnoreCase(request.getName()).ifPresent(p -> {
            throw new BadRequestException("Tên hãng đã tồn tại");
        });
        Airline a = Airline.builder()
                .code(request.getCode().toUpperCase())
                .name(request.getName())
                .logo(request.getLogo())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(repo.save(a));
    }

    @Override
    @Transactional
    public AirlineResponse update(Long id, AirlineRequest request) {
        Airline a = find(id);
        repo.findByCodeIgnoreCase(request.getCode())
                .filter(o -> !o.getId().equals(id))
                .ifPresent(o -> { throw new BadRequestException("Mã hãng đã tồn tại"); });
        repo.findByNameIgnoreCase(request.getName())
                .filter(o -> !o.getId().equals(id))
                .ifPresent(o -> { throw new BadRequestException("Tên hãng đã tồn tại"); });

        a.setCode(request.getCode().toUpperCase());
        a.setName(request.getName());
        a.setLogo(request.getLogo());
        if (request.getStatus() != null) a.setStatus(request.getStatus());
        return toResponse(a);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private Airline find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hãng hàng không không tồn tại"));
    }

    private AirlineResponse toResponse(Airline a) {
        return AirlineResponse.builder()
                .id(a.getId())
                .code(a.getCode())
                .name(a.getName())
                .logo(a.getLogo())
                .status(a.getStatus())
                .build();
    }
}
