package com.travelgo.entity;

import com.travelgo.common.enums.ActiveStatus;
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
@Table(name = "TOUR_QA")
public class TourQa {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tour_qa_seq")
    @SequenceGenerator(name = "tour_qa_seq", sequenceName = "SEQ_TOUR_QA", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(nullable = false, length = 1000)
    private String question;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;

    @Column(name = "REPLY_COUNT", nullable = false)
    @Builder.Default
    private Integer replyCount = 0;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "qa", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QaReply> replies = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ActiveStatus.ACTIVE;
        }
        if (replyCount == null) {
            replyCount = 0;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
