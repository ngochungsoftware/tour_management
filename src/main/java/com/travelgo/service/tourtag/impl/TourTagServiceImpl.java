package com.travelgo.service.tourtag.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.tourtag.TourTagRequest;
import com.travelgo.dto.tourtag.TourTagResponse;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourTag;
import com.travelgo.entity.TourTagMap;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.TourTagMapRepository;
import com.travelgo.repository.TourTagRepository;
import com.travelgo.service.tourtag.TourTagService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TourTagServiceImpl implements TourTagService {

    private final TourTagRepository tourTagRepository;
    private final TourTagMapRepository tourTagMapRepository;
    private final TourRepository tourRepository;

    @Override
    public List<TourTagResponse> findActive() {
        return tourTagRepository.findByStatus(ActiveStatus.ACTIVE).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public Page<TourTagResponse> search(String keyword, Pageable pageable) {
        Specification<TourTag> spec = (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) return cb.conjunction();
            String like = "%" + keyword.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("slug")), like)
            );
        };
        return tourTagRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public TourTagResponse get(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public TourTagResponse create(TourTagRequest request) {
        if (tourTagRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug đã tồn tại");
        }
        if (tourTagRepository.existsByNameIgnoreCase(request.getName())) {
            throw new BadRequestException("Tên nhãn đã tồn tại");
        }
        TourTag tag = TourTag.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .status(request.getStatus() == null ? ActiveStatus.ACTIVE : request.getStatus())
                .build();
        return toResponse(tourTagRepository.save(tag));
    }

    @Override
    @Transactional
    public TourTagResponse update(Long id, TourTagRequest request) {
        TourTag tag = find(id);
        tourTagRepository.findBySlug(request.getSlug())
                .filter(t -> !t.getId().equals(id))
                .ifPresent(t -> { throw new BadRequestException("Slug đã tồn tại"); });
        tourTagRepository.findByNameIgnoreCase(request.getName())
                .filter(t -> !t.getId().equals(id))
                .ifPresent(t -> { throw new BadRequestException("Tên nhãn đã tồn tại"); });

        tag.setName(request.getName());
        tag.setSlug(request.getSlug());
        if (request.getStatus() != null) tag.setStatus(request.getStatus());
        return toResponse(tag);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        tourTagMapRepository.deleteByTagId(id);
        tourTagRepository.delete(find(id));
    }

    @Override
    public List<TourTagResponse> getTagsByTour(Long tourId) {
        return tourTagMapRepository.findByTourId(tourId).stream()
                .map(m -> toResponse(m.getTag()))
                .toList();
    }

    @Override
    @Transactional
    public void setTagsForTour(Long tourId, List<Long> tagIds) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Tour không tồn tại"));
        tourTagMapRepository.deleteByTourId(tourId);

        List<TourTagMap> maps = new ArrayList<>();
        for (Long tagId : tagIds) {
            TourTag tag = tourTagRepository.findById(tagId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tag không tồn tại: " + tagId));
            TourTagMap m = TourTagMap.builder()
                    .id(new TourTagMap.TourTagMapId(tour.getId(), tag.getId()))
                    .tour(tour)
                    .tag(tag)
                    .build();
            maps.add(m);
        }
        tourTagMapRepository.saveAll(maps);
    }

    private TourTag find(Long id) {
        return tourTagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nhãn không tồn tại"));
    }

    private TourTagResponse toResponse(TourTag t) {
        return TourTagResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .slug(t.getSlug())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
