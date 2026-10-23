package com.travelgo.service.tourqa.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.dto.tourqa.QaReplyRequest;
import com.travelgo.dto.tourqa.QaReplyResponse;
import com.travelgo.dto.tourqa.TourQaRequest;
import com.travelgo.dto.tourqa.TourQaResponse;
import com.travelgo.dto.tourqa.TourQaSearchFilter;
import com.travelgo.dto.tourqa.TourQaSortBy;
import com.travelgo.entity.QaReply;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourQa;
import com.travelgo.entity.User;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ForbiddenException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.QaReplyRepository;
import com.travelgo.repository.TourQaRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.spec.TourQaSpecification;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.tourqa.TourQaService;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TourQaServiceImpl implements TourQaService {

    private final TourQaRepository tourQaRepository;
    private final QaReplyRepository qaReplyRepository;
    private final TourRepository tourRepository;

    public TourQaServiceImpl(TourQaRepository tourQaRepository,
                              QaReplyRepository qaReplyRepository,
                              TourRepository tourRepository) {
        this.tourQaRepository = tourQaRepository;
        this.qaReplyRepository = qaReplyRepository;
        this.tourRepository = tourRepository;
    }

    @Override
    public PageResponse<TourQaResponse> getByTour(Long tourId, Pageable pageable) {
        Page<TourQa> page = tourQaRepository.findByTourIdAndStatus(tourId, ActiveStatus.ACTIVE, pageable);
        return PageResponse.of(page.map(q -> toResponse(q, false)));
    }

    @Override
    public PageResponse<TourQaResponse> getAllVisible(Pageable pageable) {
        Page<TourQa> page = tourQaRepository.findAllByStatus(ActiveStatus.ACTIVE, pageable);
        return PageResponse.of(page.map(q -> toResponse(q, false)));
    }

    @Override
    public List<TourQaResponse> getMyQuestions() {
        return tourQaRepository.findByUserId(SecurityUtils.currentUserId()).stream()
                .map(q -> toResponse(q, false))
                .toList();
    }

    @Override
    public TourQaResponse getById(Long id) {
        TourQa qa = find(id);
        if (qa.getStatus() == ActiveStatus.INACTIVE) {
            throw new ResourceNotFoundException("Câu hỏi không tồn tại");
        }
        return toResponse(qa, true);
    }

    @Override
    @Transactional
    public TourQaResponse create(TourQaRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResourceNotFoundException("Tour không tồn tại"));
        User user = SecurityUtils.currentUser();
        TourQa qa = TourQa.builder()
                .tour(tour)
                .user(user)
                .question(request.getQuestion())
                .status(ActiveStatus.ACTIVE)
                .replyCount(0)
                .build();
        return toResponse(tourQaRepository.save(qa), false);
    }

    @Override
    @Transactional
    public void deleteMyQuestion(Long id) {
        TourQa qa = find(id);
        User current = SecurityUtils.currentUser();
        if (!qa.getUser().getId().equals(current.getId()) && !SecurityUtils.isStaff()) {
            throw new ForbiddenException("Không có quyền xóa câu hỏi này");
        }
        tourQaRepository.delete(qa);
    }

    @Override
    @Transactional
    public TourQaResponse changeStatus(Long id, ActiveStatus status) {
        TourQa qa = find(id);
        qa.setStatus(status);
        return toResponse(qa, false);
    }

    @Override
    @Transactional
    public QaReplyResponse addReply(QaReplyRequest request) {
        TourQa qa = find(request.getQaId());
        if (qa.getStatus() == ActiveStatus.INACTIVE) {
            throw new BadRequestException("Không thể trả lời câu hỏi đã bị ẩn");
        }
        User user = SecurityUtils.currentUser();
        QaReply reply = QaReply.builder()
                .qa(qa)
                .user(user)
                .reply(request.getReply())
                .isAnswer(false)
                .status(ActiveStatus.ACTIVE)
                .build();
        qa.setReplyCount(qa.getReplyCount() + 1);
        return toReplyResponse(qaReplyRepository.save(reply));
    }

    @Override
    public List<QaReplyResponse> getReplies(Long qaId) {
        return qaReplyRepository.findByQaIdAndStatus(qaId, ActiveStatus.ACTIVE).stream()
                .map(this::toReplyResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteMyReply(Long replyId) {
        QaReply reply = findReply(replyId);
        User current = SecurityUtils.currentUser();
        if (!reply.getUser().getId().equals(current.getId()) && !SecurityUtils.isStaff()) {
            throw new ForbiddenException("Không có quyền xóa trả lời này");
        }
        TourQa qa = reply.getQa();
        qa.setReplyCount(Math.max(0, qa.getReplyCount() - 1));
        qaReplyRepository.delete(reply);
    }

    @Override
    @Transactional
    public QaReplyResponse markAsAnswer(Long replyId) {
        QaReply reply = findReply(replyId);
        // Chủ câu hỏi hoặc nhân viên nội bộ mới được đánh dấu trả lời hay
        User current = SecurityUtils.currentUser();
        if (!reply.getQa().getUser().getId().equals(current.getId()) && !SecurityUtils.isStaff()) {
            throw new ForbiddenException("Chỉ chủ câu hỏi hoặc nhân viên mới được đánh dấu trả lời hay");
        }
        // Unmark all other replies of the same question
        qaReplyRepository.findByQaIdAndStatus(reply.getQa().getId(), ActiveStatus.ACTIVE)
                .forEach(r -> r.setIsAnswer(false));
        reply.setIsAnswer(true);
        return toReplyResponse(reply);
    }

    @Override
    @Transactional
    public QaReplyResponse unmarkAsAnswer(Long replyId) {
        QaReply reply = findReply(replyId);
        User current = SecurityUtils.currentUser();
        if (!reply.getQa().getUser().getId().equals(current.getId()) && !SecurityUtils.isStaff()) {
            throw new ForbiddenException("Không có quyền bỏ đánh dấu");
        }
        reply.setIsAnswer(false);
        return toReplyResponse(reply);
    }

    @Override
    @Transactional
    public QaReplyResponse changeReplyStatus(Long replyId, ActiveStatus status) {
        QaReply reply = findReply(replyId);
        reply.setStatus(status);
        return toReplyResponse(reply);
    }

    // ===== Advanced Search & Filter =====

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TourQaResponse> search(TourQaSearchFilter filter,
                                                 TourQaSortBy sortBy,
                                                 Pageable pageable) {
        // Xây dựng Specification từ filter
        Specification<TourQa> spec = TourQaSpecification.buildFilter(filter != null
                ? filter
                : TourQaSearchFilter.builder().build());

        // Xây dựng Sort từ sortBy (mặc định NEWEST)
        Sort sort = resolveSort(sortBy);
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                sort);

        Page<TourQa> page = tourQaRepository.findAll(spec, sortedPageable);
        return PageResponse.of(page.map(q -> toResponse(q, false)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourQaResponse> getFaq(int limit) {
        if (limit <= 0 || limit > 50) {
            limit = 10;
        }
        return tourQaRepository.findFaq(PageRequest.of(0, limit)).stream()
                .map(q -> toResponse(q, true))
                .toList();
    }

    private Sort resolveSort(TourQaSortBy sortBy) {
        TourQaSortBy effective = sortBy != null ? sortBy : TourQaSortBy.NEWEST;
        Sort.Direction direction = Sort.Direction.fromOptionalString(effective.getDirection())
                .orElse(Sort.Direction.DESC);
        return Sort.by(direction, effective.getField());
    }

    // ===== Helper methods =====

    private TourQa find(Long id) {
        return tourQaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi không tồn tại"));
    }

    private QaReply findReply(Long id) {
        return qaReplyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trả lời không tồn tại"));
    }

    private TourQaResponse toResponse(TourQa qa, boolean includeReplies) {
        return TourQaResponse.builder()
                .id(qa.getId())
                .tourId(qa.getTour() != null ? qa.getTour().getId() : null)
                .tourName(qa.getTour() != null ? qa.getTour().getName() : null)
                .userId(qa.getUser() != null ? qa.getUser().getId() : null)
                .userName(qa.getUser() != null ? qa.getUser().getFullName() : null)
                .userAvatar(qa.getUser() != null ? qa.getUser().getAvatar() : null)
                .question(qa.getQuestion())
                .status(qa.getStatus())
                .replyCount(qa.getReplyCount())
                .createdAt(qa.getCreatedAt())
                .updatedAt(qa.getUpdatedAt())
                .replies(includeReplies
                        ? qaReplyRepository.findByQaIdAndStatus(qa.getId(), ActiveStatus.ACTIVE)
                                .stream().map(this::toReplyResponse).toList()
                        : null)
                .build();
    }

    private QaReplyResponse toReplyResponse(QaReply reply) {
        return QaReplyResponse.builder()
                .id(reply.getId())
                .qaId(reply.getQa() != null ? reply.getQa().getId() : null)
                .userId(reply.getUser() != null ? reply.getUser().getId() : null)
                .userName(reply.getUser() != null ? reply.getUser().getFullName() : null)
                .userAvatar(reply.getUser() != null ? reply.getUser().getAvatar() : null)
                .reply(reply.getReply())
                .isAnswer(reply.getIsAnswer())
                .status(reply.getStatus())
                .createdAt(reply.getCreatedAt())
                .updatedAt(reply.getUpdatedAt())
                .build();
    }
}
