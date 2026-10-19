package com.travelgo.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOUR_ITINERARIES")
public class TourItinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "itinerary_seq")
    @SequenceGenerator(name = "itinerary_seq", sequenceName = "SEQ_TOUR_ITINERARIES", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "DAY_NUMBER", nullable = false)
    private Integer dayNumber;

    @Column(nullable = false)
    private String title;

    @Lob
    private String description;
}
