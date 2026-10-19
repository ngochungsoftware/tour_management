package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOUR_IMAGES")
public class TourImage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tour_image_seq")
    @SequenceGenerator(name = "tour_image_seq", sequenceName = "SEQ_TOUR_IMAGES", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "IMAGE_URL", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "IS_COVER", nullable = false)
    @Builder.Default
    private Boolean cover = false;

    @Column(name = "SORT_ORDER")
    @Builder.Default
    private Integer sortOrder = 0;
}
