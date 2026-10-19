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
@Table(name = "QA_REPLIES")
public class QaReply {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "qa_reply_seq")
    @SequenceGenerator(name = "qa_reply_seq", sequenceName = "SEQ_QA_REPLIES", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "QA_ID", nullable = false)
    private TourQa qa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(nullable = false, length = 2000)
    private String reply;

    @Column(name = "IS_ANSWER", nullable = false)
    @Builder.Default
    private Boolean isAnswer = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ActiveStatus.ACTIVE;
        }
        if (isAnswer == null) {
            isAnswer = false;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
