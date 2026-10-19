package com.travelgo.service.admin.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.BookingStatus;
import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.UserStatus;
import com.travelgo.dto.admin.DashboardResponse;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.entity.User;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.PostRepository;
import com.travelgo.repository.TourQaRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.service.admin.AdminService;
import com.travelgo.service.UserMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final PostRepository postRepository;
    private final TourQaRepository tourQaRepository;
    private final UserMapper userMapper;

    public AdminServiceImpl(UserRepository userRepository,
                            TourRepository tourRepository,
                            BookingRepository bookingRepository,
                            PostRepository postRepository,
                            TourQaRepository tourQaRepository,
                            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.tourRepository = tourRepository;
        this.bookingRepository = bookingRepository;
        this.postRepository = postRepository;
        this.tourQaRepository = tourQaRepository;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse dashboard() {
        return DashboardResponse.builder()
                .totalCustomers(userRepository.findAll().stream()
                        .filter(user -> user.getRoles().stream()
                                .anyMatch(role -> role.getName() == RoleName.CUSTOMER))
                        .count())
                .totalTours(tourRepository.count())
                .totalBookings(bookingRepository.count())
                .totalPosts(postRepository.count())
                .totalQuestions(tourQaRepository.countByStatus(ActiveStatus.ACTIVE))
                .totalRevenue(bookingRepository.sumRevenue())
                .pendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING))
                .confirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
                .cancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED))
                .completedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED))
                .build();
    }

    @Override
    public Page<UserResponse> users(String keyword, Pageable pageable) {
        return userRepository.search(keyword, pageable).map(user -> {
            user.getRoles().size();
            return userMapper.toResponse(user);
        });
    }

    @Override
    public UserResponse userDetail(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));
        user.getRoles().size();
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse changeUserStatus(Long id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khách hàng không tồn tại"));
        user.setStatus(status);
        user.getRoles().size();
        return userMapper.toResponse(user);
    }
}
