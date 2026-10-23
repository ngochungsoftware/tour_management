package com.travelgo.entity;

import com.travelgo.common.enums.ActiveStatus;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "DEPARTURE_POINTS")
public class DeparturePoint {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "departure_point_seq")
    @SequenceGenerator(name = "departure_point_seq", sequenceName = "SEQ_DEPARTURE_POINTS", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(nullable = false, length = 150)
    private String city;

    @Column(length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;
}
