package com.travelgo.entity;

import com.travelgo.common.enums.Gender;
import com.travelgo.common.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(name = "user_seq", sequenceName = "SEQ_USERS", allocationSize = 1)
    private Long id;

    @Column(name = "FULL_NAME", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "DATE_OF_BIRTH")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(length = 255)
    private String address;

    @Column(length = 500)
    private String avatar;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "RESET_TOKEN")
    private String resetToken;

    @Column(name = "RESET_TOKEN_EXPIRY")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "USER_ROLES",
            joinColumns = @JoinColumn(name = "USER_ID"),
            inverseJoinColumns = @JoinColumn(name = "ROLE_ID")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = UserStatus.ACTIVE;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
