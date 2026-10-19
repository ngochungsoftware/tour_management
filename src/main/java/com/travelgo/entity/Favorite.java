package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "FAVORITES", uniqueConstraints = @UniqueConstraint(columnNames = {"USER_ID", "TOUR_ID"}))
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "favorite_seq")
    @SequenceGenerator(name = "favorite_seq", sequenceName = "SEQ_FAVORITES", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
