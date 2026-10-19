package com.travelgo.entity;

import com.travelgo.common.enums.PostStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "POSTS")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_seq")
    @SequenceGenerator(name = "post_seq", sequenceName = "SEQ_POSTS", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(length = 500)
    private String excerpt;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(length = 500)
    private String thumbnail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AUTHOR_ID", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CATEGORY_ID", nullable = false)
    private PostCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PostStatus status = PostStatus.DRAFT;

    @Column(name = "VIEW_COUNT", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(name = "PUBLISHED_AT")
    private LocalDateTime publishedAt;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PostComment> comments = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = PostStatus.DRAFT;
        }
        if (viewCount == null) {
            viewCount = 0;
        }
        if (featured == null) {
            featured = false;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
