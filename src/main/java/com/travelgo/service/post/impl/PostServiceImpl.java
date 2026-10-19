package com.travelgo.service.post.impl;

import com.travelgo.common.enums.PostStatus;
import com.travelgo.dto.post.PostCommentResponse;
import com.travelgo.dto.post.PostRequest;
import com.travelgo.dto.post.PostResponse;
import com.travelgo.entity.Post;
import com.travelgo.entity.PostCategory;
import com.travelgo.entity.User;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.PostCommentRepository;
import com.travelgo.repository.PostRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.post.PostCategoryService;
import com.travelgo.service.post.PostService;
import com.travelgo.util.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostCommentRepository postCommentRepository;
    private final PostCategoryService postCategoryService;

    public PostServiceImpl(PostRepository postRepository,
                           PostCommentRepository postCommentRepository,
                           PostCategoryService postCategoryService) {
        this.postRepository = postRepository;
        this.postCommentRepository = postCommentRepository;
        this.postCategoryService = postCategoryService;
    }

    @Override
    public PageResponse<PostResponse> searchPublished(String keyword, Long categoryId, Pageable pageable) {
        Page<Post> page;
        if (categoryId != null) {
            page = postRepository.findPublishedByCategory(categoryId, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            page = postRepository.searchPublished(keyword, pageable);
        } else {
            page = postRepository.findByStatus(PostStatus.PUBLISHED, pageable);
        }
        return PageResponse.of(page.map(p -> toResponse(p, false, false)));
    }

    @Override
    @Transactional
    public PostResponse getById(Long id) {
        Post post = find(id);
        post.setViewCount(post.getViewCount() + 1);
        return toResponse(post, true, true);
    }

    @Override
    @Transactional
    public PostResponse getBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));
        post.setViewCount(post.getViewCount() + 1);
        return toResponse(post, true, true);
    }

    @Override
    public PostResponse incrementView(Long id) {
        Post post = find(id);
        post.setViewCount(post.getViewCount() + 1);
        return toResponse(post, false, false);
    }

    @Override
    public List<PostResponse> getTopFeatured(int limit) {
        return postRepository.findTopFeatured(PageRequest.of(0, limit)).stream()
                .map(p -> toResponse(p, false, false))
                .toList();
    }

    @Override
    public List<PostResponse> getRelated(Long postId, int limit) {
        Post post = find(postId);
        return postRepository.findPublishedByCategory(post.getCategory().getId(), PageRequest.of(0, limit + 1))
                .stream()
                .filter(p -> !p.getId().equals(postId))
                .limit(limit)
                .map(p -> toResponse(p, false, false))
                .toList();
    }

    @Override
    @Transactional
    public PostResponse create(PostRequest request) {
        if (postRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug bài viết đã tồn tại");
        }
        User author = SecurityUtils.currentUser();
        PostCategory category = postCategoryService.find(request.getCategoryId());

        PostStatus status = request.getStatus() == null ? PostStatus.DRAFT : request.getStatus();
        Post post = Post.builder()
                .title(request.getTitle())
                .slug(request.getSlug().toLowerCase())
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .thumbnail(request.getThumbnail())
                .author(author)
                .category(category)
                .status(status)
                .featured(Boolean.TRUE.equals(request.getFeatured()))
                .viewCount(0)
                .publishedAt(status == PostStatus.PUBLISHED ? LocalDateTime.now() : null)
                .build();
        return toResponse(postRepository.save(post), true, false);
    }

    @Override
    @Transactional
    public PostResponse update(Long id, PostRequest request) {
        Post post = find(id);
        if (!post.getSlug().equals(request.getSlug()) && postRepository.existsBySlug(request.getSlug())) {
            throw new BadRequestException("Slug bài viết đã tồn tại");
        }
        PostCategory category = postCategoryService.find(request.getCategoryId());
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug().toLowerCase());
        post.setExcerpt(request.getExcerpt());
        post.setContent(request.getContent());
        post.setThumbnail(request.getThumbnail());
        post.setCategory(category);
        if (request.getFeatured() != null) {
            post.setFeatured(request.getFeatured());
        }
        if (request.getStatus() != null && request.getStatus() != post.getStatus()) {
            post.setStatus(request.getStatus());
            if (request.getStatus() == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
                post.setPublishedAt(LocalDateTime.now());
            }
        }
        return toResponse(post, true, true);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        postRepository.delete(find(id));
    }

    @Override
    @Transactional
    public PostResponse changeStatus(Long id, PostStatus status) {
        Post post = find(id);
        post.setStatus(status);
        if (status == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        return toResponse(post, false, false);
    }

    private Post find(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài viết không tồn tại"));
    }

    @Override
    public PostResponse toResponse(Post post, boolean includeContent, boolean includeComments) {
        long commentCount = postCommentRepository.countByPostIdAndStatus(
                post.getId(), com.travelgo.common.enums.ActiveStatus.ACTIVE);
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .excerpt(post.getExcerpt())
                .thumbnail(post.getThumbnail())
                .authorId(post.getAuthor() != null ? post.getAuthor().getId() : null)
                .authorName(post.getAuthor() != null ? post.getAuthor().getFullName() : null)
                .categoryId(post.getCategory() != null ? post.getCategory().getId() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .status(post.getStatus())
                .viewCount(post.getViewCount())
                .featured(post.getFeatured())
                .publishedAt(post.getPublishedAt())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(commentCount)
                .comments(includeComments
                        ? post.getComments().stream().map(this::toCommentResponse).toList()
                        : null)
                .build();
    }

    @Override
    public PostCommentResponse toCommentResponse(com.travelgo.entity.PostComment comment) {
        return PostCommentResponse.builder()
                .id(comment.getId())
                .postId(comment.getPost() != null ? comment.getPost().getId() : null)
                .userId(comment.getUser() != null ? comment.getUser().getId() : null)
                .userName(comment.getUser() != null ? comment.getUser().getFullName() : null)
                .content(comment.getContent())
                .status(comment.getStatus())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}
