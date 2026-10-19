package com.travelgo.entity;

import com.travelgo.common.enums.Gender;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "BOOKING_GUESTS")
public class BookingGuest {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "guest_seq")
    @SequenceGenerator(name = "guest_seq", sequenceName = "SEQ_BOOKING_GUESTS", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "BOOKING_ID", nullable = false)
    private Booking booking;

    @Column(name = "FULL_NAME", nullable = false, length = 150)
    private String fullName;

    @Column(name = "DATE_OF_BIRTH")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "IDENTITY_NUMBER", length = 50)
    private String identityNumber;
}
