package com.travelgo.entity;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "POST_CATEGORIES")
public class PostCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "post_category_seq")
    @SequenceGenerator(name = "post_category_seq", sequenceName = "SEQ_POST_CATEGORIES", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ActiveStatus.ACTIVE;
        }
    }
}
