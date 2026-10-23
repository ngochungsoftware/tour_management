package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOUR_DESTINATIONS")
public class TourDestination {

    @EmbeddedId
    private TourDestinationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tourId")
    @JoinColumn(name = "TOUR_ID")
    private Tour tour;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("destinationId")
    @JoinColumn(name = "DESTINATION_ID")
    private Destination destination;

    @Column(name = "SORT_ORDER")
    @Builder.Default
    private Integer sortOrder = 0;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TourDestinationId implements java.io.Serializable {
        @Column(name = "TOUR_ID")
        private Long tourId;
        @Column(name = "DESTINATION_ID")
        private Long destinationId;
    }
}
