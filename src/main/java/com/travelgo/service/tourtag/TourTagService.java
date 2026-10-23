package com.travelgo.service.tourtag;

import com.travelgo.dto.tourtag.TourTagRequest;
import com.travelgo.dto.tourtag.TourTagResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TourTagService {
    List<TourTagResponse> findActive();
    Page<TourTagResponse> search(String keyword, Pageable pageable);
    TourTagResponse get(Long id);
    TourTagResponse create(TourTagRequest request);
    TourTagResponse update(Long id, TourTagRequest request);
    void delete(Long id);
    List<TourTagResponse> getTagsByTour(Long tourId);
    void setTagsForTour(Long tourId, List<Long> tagIds);
}
