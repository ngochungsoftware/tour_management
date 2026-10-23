package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOUR_TAG_MAP")
public class TourTagMap {

    @EmbeddedId
    private TourTagMapId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tourId")
    @JoinColumn(name = "TOUR_ID")
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    @JoinColumn(name = "TAG_ID")
    private TourTag tag;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TourTagMapId implements java.io.Serializable {
        @Column(name = "TOUR_ID")
        private Long tourId;
        @Column(name = "TAG_ID")
        private Long tagId;
    }
}
