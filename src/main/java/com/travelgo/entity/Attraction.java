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
@Table(name = "ATTRACTIONS")
public class Attraction {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "attraction_seq")
    @SequenceGenerator(name = "attraction_seq", sequenceName = "SEQ_ATTRACTIONS", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DESTINATION_ID", nullable = false)
    private Destination destination;

    @Lob
    private String description;

    @Column(length = 500)
    private String image;

    @Column(length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = ActiveStatus.ACTIVE;
    }
}
