package com.travelgo.entity;

import com.travelgo.common.enums.ScheduleStatus;
import jakarta.persistence.*;
import lombok.*;

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
}
