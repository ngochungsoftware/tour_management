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
@Table(name = "AIRLINES")
public class Airline {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "airline_seq")
    @SequenceGenerator(name = "airline_seq", sequenceName = "SEQ_AIRLINES", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(nullable = false, unique = true, length = 200)
    private String name;

    @Column(length = 500)
    private String logo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;
}
