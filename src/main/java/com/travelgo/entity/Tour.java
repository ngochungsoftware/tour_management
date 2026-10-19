package com.travelgo.entity;

import com.travelgo.common.enums.TourStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "TOURS")
public class Tour {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tour_seq")
    @SequenceGenerator(name = "tour_seq", sequenceName = "SEQ_TOURS", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CATEGORY_ID", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DESTINATION_ID", nullable = false)
    private Destination destination;

    @Lob
    private String description;

    @Column(name = "DURATION_DAYS", nullable = false)
    private Integer durationDays;

    @Column(name = "DURATION_NIGHTS", nullable = false)
    private Integer durationNights;

    @Column(name = "ORIGINAL_PRICE", precision = 14, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "ADULT_PRICE", nullable = false, precision = 14, scale = 2)
    private BigDecimal adultPrice;

    @Column(name = "CHILD_PRICE", nullable = false, precision = 14, scale = 2)
    private BigDecimal childPrice;

    @Column(name = "INFANT_PRICE", nullable = false, precision = 14, scale = 2)
    @Builder.Default
    private BigDecimal infantPrice = BigDecimal.ZERO;

    @Column(name = "MAX_PEOPLE", nullable = false)
    private Integer maxPeople;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TourStatus status = TourStatus.ACTIVE;

    @Column(name = "AVERAGE_RATING", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column(name = "REVIEW_COUNT")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean featured = false;

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TourImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    @Builder.Default
    private List<TourItinerary> itineraries = new ArrayList<>();

    @OneToMany(mappedBy = "tour", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TourSchedule> schedules = new ArrayList<>();

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = TourStatus.ACTIVE;
        }
        if (featured == null) {
            featured = false;
        }
        if (averageRating == null) {
            averageRating = BigDecimal.ZERO;
        }
        if (reviewCount == null) {
            reviewCount = 0;
        }
        if (infantPrice == null) {
            infantPrice = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String coverImage() {
        return images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getCover()))
                .map(TourImage::getImageUrl)
                .findFirst()
                .orElseGet(() -> images.isEmpty() ? null : images.get(0).getImageUrl());
    }
}
