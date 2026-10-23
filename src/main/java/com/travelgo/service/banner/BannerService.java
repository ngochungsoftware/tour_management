package com.travelgo.service.banner;

import com.travelgo.common.enums.BannerPosition;
import com.travelgo.dto.banner.BannerRequest;
import com.travelgo.dto.banner.BannerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BannerService {
    List<BannerResponse> findActiveByPosition(BannerPosition position);
    Page<BannerResponse> search(BannerPosition position, String keyword, Pageable pageable);
    BannerResponse get(Long id);
    BannerResponse create(BannerRequest request);
    BannerResponse update(Long id, BannerRequest request);
    void delete(Long id);
}
