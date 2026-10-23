package com.travelgo.service.banner.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.BannerPosition;
import com.travelgo.dto.banner.BannerRequest;
import com.travelgo.dto.banner.BannerResponse;
import com.travelgo.entity.Banner;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.BannerRepository;
import com.travelgo.service.banner.BannerService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BannerServiceImpl implements BannerService {

    private final BannerRepository repo;

    @Override
    public List<BannerResponse> findActiveByPosition(BannerPosition position) {
        return repo.findByPositionAndStatusOrderBySortOrderAsc(position, ActiveStatus.ACTIVE)
                .stream()
                .filter(b -> (b.getStartDate() == null || b.getStartDate().isBefore(LocalDateTime.now().plusSeconds(1)))
                        && (b.getEndDate() == null || b.getEndDate().isAfter(LocalDateTime.now().minusSeconds(1))))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Page<BannerResponse> search(BannerPosition position, String keyword, Pageable pageable) {
        Specification<Banner> spec = (root, query, cb) -> {
            List<Predicate> predicates = new java.util.ArrayList<>();
            if (position != null) predicates.add(cb.equal(root.get("position"), position));
            if (keyword != null && !keyword.isBlank()) {
                String like = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("title")), like));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return repo.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public BannerResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public BannerResponse create(BannerRequest request) {
        Banner b = Banner.builder()
                .title(request.getTitle())
                .subtitle(request.getSubtitle())
                .imageUrl(request.getImageUrl())
                .linkUrl(request.getLinkUrl())
                .position(request.getPosition())
                .sortOrder(request.getSortOrder() == null ? 0 : request.getSortOrder())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(repo.save(b));
    }

    @Override
    @Transactional
    public BannerResponse update(Long id, BannerRequest request) {
        Banner b = find(id);
        b.setTitle(request.getTitle());
        b.setSubtitle(request.getSubtitle());
        b.setImageUrl(request.getImageUrl());
        b.setLinkUrl(request.getLinkUrl());
        b.setPosition(request.getPosition());
        if (request.getSortOrder() != null) b.setSortOrder(request.getSortOrder());
        b.setStartDate(request.getStartDate());
        b.setEndDate(request.getEndDate());
        if (request.getStatus() != null) b.setStatus(request.getStatus());
        return toResponse(b);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private Banner find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Banner không tồn tại"));
    }

    private BannerResponse toResponse(Banner b) {
        return BannerResponse.builder()
                .id(b.getId())
                .title(b.getTitle())
                .subtitle(b.getSubtitle())
                .imageUrl(b.getImageUrl())
                .linkUrl(b.getLinkUrl())
                .position(b.getPosition())
                .sortOrder(b.getSortOrder())
                .startDate(b.getStartDate())
                .endDate(b.getEndDate())
                .status(b.getStatus())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .build();
    }
}
