package com.travelgo.dto.admin;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class DashboardResponse {
    private long totalCustomers;
    private long totalTours;
    private long totalBookings;
    private long totalPosts;
    private long totalQuestions;
    private BigDecimal totalRevenue;
    private long pendingBookings;
    private long confirmedBookings;
    private long cancelledBookings;
    private long completedBookings;
}
