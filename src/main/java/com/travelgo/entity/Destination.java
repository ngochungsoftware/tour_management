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
@Table(name = "DESTINATIONS")
public class Destination {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "destination_seq")
    @SequenceGenerator(name = "destination_seq", sequenceName = "SEQ_DESTINATIONS", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Column(nullable = false, length = 150)
    private String province;

    @Lob
    private String description;

    @Column(length = 500)
    private String image;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ActiveStatus status = ActiveStatus.ACTIVE;
}
