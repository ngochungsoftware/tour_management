package com.travelgo.entity;

import com.travelgo.common.enums.ScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOUR_SCHEDULES")
public class TourSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "schedule_seq")
    @SequenceGenerator(name = "schedule_seq", sequenceName = "SEQ_TOUR_SCHEDULES", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TOUR_ID", nullable = false)
    private Tour tour;

    @Column(name = "DEPARTURE_DATE", nullable = false)
    private LocalDate departureDate;

    @Column(name = "RETURN_DATE", nullable = false)
    private LocalDate returnDate;

    @Column(name = "TOTAL_SEATS", nullable = false)
    private Integer totalSeats;

    @Column(name = "AVAILABLE_SEATS", nullable = false)
    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ScheduleStatus status = ScheduleStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DEPARTURE_POINT_ID")
    private DeparturePoint departurePoint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRANSPORT_MODE_ID")
    private TransportMode transportMode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AIRLINE_ID")
    private Airline airline;

    @Column(name = "ADULT_PRICE", precision = 14, scale = 2)
    private BigDecimal adultPrice;

    @Column(name = "CHILD_PRICE", precision = 14, scale = 2)
    private BigDecimal childPrice;
}
