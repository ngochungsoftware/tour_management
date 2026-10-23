package com.travelgo.service.admin.impl;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.BookingStatus;
import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.UserStatus;
import com.travelgo.dto.admin.DashboardResponse;
import com.travelgo.dto.user.UserCreateRequest;
import com.travelgo.dto.user.UserResponse;
import com.travelgo.dto.user.UserUpdateRequest;
import com.travelgo.entity.Role;
import com.travelgo.entity.User;
import com.travelgo.exception.BadRequestException;
import com.travelgo.exception.ResourceNotFoundException;
import com.travelgo.repository.BookingRepository;
import com.travelgo.repository.FavoriteRepository;
import com.travelgo.repository.PostCommentRepository;
import com.travelgo.repository.PostRepository;
import com.travelgo.repository.QaReplyRepository;
import com.travelgo.repository.ReviewRepository;
import com.travelgo.repository.RoleRepository;
import com.travelgo.repository.TourQaRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.UserRepository;
import com.travelgo.security.SecurityUtils;
import com.travelgo.service.UserMapper;
import com.travelgo.service.admin.AdminService;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final TourRepository tourRepository;
    private final BookingRepository bookingRepository;
    private final PostRepository postRepository;
    private final TourQaRepository tourQaRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteRepository favoriteRepository;
    private final PostCommentRepository postCommentRepository;
    private final QaReplyRepository qaReplyRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public AdminServiceImpl(UserRepository userRepository,
                            RoleRepository roleRepository,
                            TourRepository tourRepository,
                            BookingRepository bookingRepository,
                            PostRepository postRepository,
                            TourQaRepository tourQaRepository,
                            ReviewRepository reviewRepository,
                            FavoriteRepository favoriteRepository,
                            PostCommentRepository postCommentRepository,
                            QaReplyRepository qaReplyRepository,
                            PasswordEncoder passwordEncoder,
                            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.tourRepository = tourRepository;
        this.bookingRepository = bookingRepository;
        this.postRepository = postRepository;
        this.tourQaRepository = tourQaRepository;
        this.reviewRepository = reviewRepository;
        this.favoriteRepository = favoriteRepository;
        this.postCommentRepository = postCommentRepository;
        this.qaReplyRepository = qaReplyRepository;
        this.passwordEncoder = passwordEncoder;
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
    @Transactional(readOnly = true)
    public Page<UserResponse> users(String keyword, Set<RoleName> roles, UserStatus status, Pageable pageable) {
        // Specification không dùng được @EntityGraph, nên phải khởi tạo lazy
        // collection "roles" trong transaction trước khi map sang DTO.
        return userRepository.findAll(byRoleAndStatus(keyword, roles, status), pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse userDetail(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional
    public UserResponse changeUserStatus(Long id, UserStatus status) {
        User user = find(id);
        user.setStatus(status);
        return toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest request, Set<RoleName> allowedRoles) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã được sử dụng");
        }
        Set<Role> roles = resolveRoles(request.getRoles(), allowedRoles, "Bạn phải chọn ít nhất một vai trò");

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .gender(request.getGender())
                .address(request.getAddress())
                .status(request.getStatus() == null ? UserStatus.ACTIVE : request.getStatus())
                .roles(new HashSet<>(roles))
                .build();
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest request, Set<RoleName> allowedRoles) {
        User user = find(id);

        String email = normalizeEmail(request.getEmail());
        if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email đã được sử dụng");
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setGender(request.getGender());
        user.setAddress(request.getAddress());
        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        // roles null = không đổi (partial update); roles rỗng = gỡ hết (bị chặn vì mọi
        // user đều cần ít nhất ADMIN/STAFF/CUSTOMER).
        if (request.getRoles() != null) {
            Set<Role> roles = resolveRoles(request.getRoles(), allowedRoles, "Bạn phải chọn ít nhất một vai trò");
            guardSelfRoleRemoval(user, roles);
            user.getRoles().clear();
            user.getRoles().addAll(roles);
        }
        return toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = find(id);
        // Không cho admin tự khóa chính mình rồi mất quyền truy cập hệ thống.
        if (id.equals(SecurityUtils.currentUserId())) {
            throw new BadRequestException("Không thể xóa tài khoản đang đăng nhập");
        }

        List<String> blockers = referenceBlockers(user);
        if (!blockers.isEmpty()) {
            throw new BadRequestException(
                    "Không thể xóa vì tài khoản còn dữ liệu liên quan: " + String.join(", ", blockers)
                            + ". Bạn có thể khóa tài khoản thay vì xóa.");
        }

        // Quan hệ ManyToMany cần gỡ thủ công trước khi xóa.
        user.getRoles().clear();
        userRepository.delete(user);
    }

    // ===== Helpers =====

    /**
     * Chặn việc tự gỡ quyền ADMIN của chính mình — nếu không, admin cuối cùng
     * có thể tự khoá mình ra khỏi hệ thống.
     */
    private void guardSelfRoleRemoval(User user, Set<Role> newRoles) {
        Long currentId = SecurityUtils.currentUserId();
        if (!user.getId().equals(currentId)) {
            return;
        }
        boolean losesAdmin = user.getRoles().stream().anyMatch(r -> r.getName() == RoleName.ADMIN)
                && newRoles.stream().noneMatch(r -> r.getName() == RoleName.ADMIN);
        if (losesAdmin) {
            throw new BadRequestException("Không thể tự gỡ quyền Administrator của chính mình");
        }
    }

    /** Liệt kê các bảng còn tham chiếu tới user, phục vụ thông báo khi không cho xóa. */
    private List<String> referenceBlockers(User user) {
        Long id = user.getId();
        List<String> blockers = new java.util.ArrayList<>();
        long bookings = bookingRepository.countByUserId(id);
        if (bookings > 0) blockers.add(bookings + " đơn đặt tour");
        long reviews = reviewRepository.countByUserId(id);
        if (reviews > 0) blockers.add(reviews + " đánh giá");
        long questions = tourQaRepository.countByUserId(id);
        if (questions > 0) blockers.add(questions + " câu hỏi");
        long replies = qaReplyRepository.countByUserId(id);
        if (replies > 0) blockers.add(replies + " trả lời hỏi đáp");
        long comments = postCommentRepository.countByUserId(id);
        if (comments > 0) blockers.add(comments + " bình luận");
        long posts = postRepository.countByAuthorId(id);
        if (posts > 0) blockers.add(posts + " bài viết");
        long favorites = favoriteRepository.countByUserId(id);
        if (favorites > 0) blockers.add(favorites + " tour yêu thích");
        return blockers;
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    /**
     * Chuyển danh sách role sang entity, loại bỏ các role ngoài phạm vi cho phép.
     * Màn "Nhân viên" chỉ cho ADMIN/STAFF, màn "Khách hàng" chỉ cho CUSTOMER —
     * nhờ vậy không thể lợi dụng endpoint để tạo tài khoản vượt quyền.
     */
    private Set<Role> resolveRoles(Set<RoleName> requested, Set<RoleName> allowedRoles, String messageIfEmpty) {
        Set<RoleName> wanted = new LinkedHashSet<>();
        if (requested != null) {
            requested.stream().filter(Objects::nonNull).forEach(wanted::add);
        }
        // Chỉ giữ lại các role nằm trong phạm vi được phép.
        wanted.retainAll(allowedRoles);

        if (wanted.isEmpty()) {
            throw new BadRequestException(messageIfEmpty);
        }
        Set<Role> roles = new HashSet<>();
        for (RoleName name : wanted) {
            roles.add(roleRepository.findByName(name)
                    .orElseThrow(() -> new ResourceNotFoundException("Vai trò " + name + " chưa được khởi tạo")));
        }
        return roles;
    }

    private User find(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));
    }

    /**
     * Specification lọc theo từ khoá + role + trạng thái.
     * Dùng subquery EXISTS thay vì join để không nhân bản dòng khi user có nhiều role.
     */
    private Specification<User> byRoleAndStatus(String keyword, Set<RoleName> roles, UserStatus status) {
        return (root, query, cb) -> {
            Predicate p = cb.conjunction();

            if (StringUtils.hasText(keyword)) {
                String like = "%" + keyword.trim().toLowerCase() + "%";
                p = cb.and(p, cb.or(
                        cb.like(cb.lower(root.get("fullName")), like),
                        cb.like(cb.lower(root.get("email")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("phone"), "")), like)));
            }

            Set<RoleName> wanted = roles == null ? Set.of() : roles.stream()
                    .filter(Objects::nonNull)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            if (!wanted.isEmpty()) {
                // EXISTS trên join USER_ROLES thay vì join thẳng "roles" để
                // không nhân bản dòng (một user có thể có nhiều role) → total sai.
                Subquery<Long> sub = query.subquery(Long.class);
                Root<User> subUser = sub.from(User.class);
                var subRoles = subUser.join("roles", JoinType.INNER);
                sub.select(cb.literal(1L))
                        .where(cb.equal(subUser.get("id"), root.get("id")),
                                subRoles.get("name").in(wanted));
                p = cb.and(p, cb.exists(sub));
            }

            if (status != null) {
                p = cb.and(p, cb.equal(root.get("status"), status));
            }
            return p;
        };
    }

    private UserResponse toResponse(User user) {
        user.getRoles().size(); // khởi tạo lazy collection trước khi mapper đọc
        return userMapper.toResponse(user);
    }
}