package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOUR_ATTRACTIONS")
public class TourAttraction {

    @EmbeddedId
    private TourAttractionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tourId")
    @JoinColumn(name = "TOUR_ID")
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("attractionId")
    @JoinColumn(name = "ATTRACTION_ID")
    private Attraction attraction;

    @Column(name = "VISIT_ORDER")
    @Builder.Default
    private Integer visitOrder = 0;

    @Column(length = 500)
    private String note;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TourAttractionId implements java.io.Serializable {
        @Column(name = "TOUR_ID")
        private Long tourId;
        @Column(name = "ATTRACTION_ID")
        private Long attractionId;
    }
}
