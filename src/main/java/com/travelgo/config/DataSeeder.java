package com.travelgo.config;

import com.travelgo.common.enums.ActiveStatus;
import com.travelgo.common.enums.Gender;
import com.travelgo.common.enums.RoleName;
import com.travelgo.common.enums.ScheduleStatus;
import com.travelgo.common.enums.UserStatus;
import com.travelgo.entity.Airline;
import com.travelgo.entity.DeparturePoint;
import com.travelgo.entity.Role;
import com.travelgo.entity.Tour;
import com.travelgo.entity.TourSchedule;
import com.travelgo.entity.TransportMode;
import com.travelgo.entity.User;
import com.travelgo.repository.AirlineRepository;
import com.travelgo.repository.DeparturePointRepository;
import com.travelgo.repository.RoleRepository;
import com.travelgo.repository.TourRepository;
import com.travelgo.repository.TourScheduleRepository;
import com.travelgo.repository.TransportModeRepository;
import com.travelgo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Tự động tạo user mẫu + schedule mẫu khi app start (nếu app.seed.enabled=true trong application.yml).
 * - ADMIN:   admin@travelgo.com   / Admin@123
 * - CUSTOMER: customer@travelgo.com / Customer@123
 * - Lịch khởi hành: mỗi tour sẽ có 3 lịch cách nhau ~2 tuần (14, 28, 42 ngày từ hôm nay).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TourRepository tourRepository;
    private final TourScheduleRepository scheduleRepository;
    private final TransportModeRepository transportModeRepository;
    private final DeparturePointRepository departurePointRepository;
    private final AirlineRepository airlineRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("DataSeeder: app.seed.enabled=false => skip");
            return;
        }

        log.info("DataSeeder: starting...");

        // 1. Đảm bảo roles tồn tại
        Role adminRole = ensureRole(RoleName.ADMIN);
        Role staffRole = ensureRole(RoleName.STAFF);
        Role customerRole = ensureRole(RoleName.CUSTOMER);

        // 2. Seed user admin
        seedUserIfMissing(
                "admin@travelgo.com",
                "Administrator",
                "Admin@123",
                Gender.MALE,
                "0900000001",
                "Hà Nội",
                UserStatus.ACTIVE,
                Set.of(adminRole)
        );

        // 3. Seed user nhân viên (xem/duyệt đơn, quản lý tour, trả lời hỏi đáp)
        seedUserIfMissing(
                "staff@travelgo.com",
                "Nhân viên demo",
                "Staff@123",
                Gender.FEMALE,
                "0900000003",
                "Hà Nội",
                UserStatus.ACTIVE,
                Set.of(staffRole)
        );

        // 4. Seed user customer
        seedUserIfMissing(
                "customer@travelgo.com",
                "Khách hàng demo",
                "Customer@123",
                Gender.FEMALE,
                "0900000002",
                "TP. Hồ Chí Minh",
                UserStatus.ACTIVE,
                Set.of(customerRole)
        );

        // 5. Seed lịch khởi hành mẫu cho các tour chưa có lịch
        seedSchedulesForToursWithout();

        // 6. Seed phương tiện / điểm khởi hành / hãng bay, rồi gán vào các lịch chưa có
        seedTransportCatalogAndAssign();

        log.info("DataSeeder: done. Users: admin@travelgo.com / Admin@123, "
                + "staff@travelgo.com / Staff@123, customer@travelgo.com / Customer@123");
    }

    /**
     * Tạo dữ liệu phương tiện di chuyển, điểm khởi hành và hãng bay mẫu,
     * sau đó gán ngẫu nhiên cho các lịch khởi hành chưa có thông tin này.
     */
    private void seedTransportCatalogAndAssign() {
        TransportMode plane = ensureTransportMode("Máy bay", "Di chuyển bằng đường không", "Plane");
        ensureTransportMode("Tàu hỏa", "Di chuyển bằng đường sắt", "Train");
        ensureTransportMode("Xe khách", "Di chuyển bằng đường bộ", "Bus");
        ensureTransportMode("Tàu thủy", "Di chuyển bằng đường biển", "Ship");
        TransportMode ship = transportModeRepository.findByNameIgnoreCase("Tàu thủy").orElse(null);

        ensureDeparturePoint("Sân bay Nội Bài", "Hà Nội", "Số 1, đường Võ Nguyên Giáp, Nam Từ Liêm");
        ensureDeparturePoint("Ga Hà Nội", "Hà Nội", "Đường Trần Hưng Đạo, Hoàn Kiếm");
        ensureDeparturePoint("Sân bay Tân Sơn Nhất", "TP. Hồ Chí Minh", "Đường Trường Sơn, Tân Bình");

        ensureAirline("VN", "Vietnam Airlines");
        ensureAirline("VJ", "VietJet Air");
        ensureAirline("VU", "Vietravel Airlines");

        // Gán cho các lịch chưa có phương tiện
        List<TourSchedule> schedules = scheduleRepository.findAll();
        if (schedules.isEmpty()) {
            log.info("DataSeeder: no schedules to assign transport => skip");
            return;
        }

        List<TransportMode> modes = List.of(plane, ship);
        List<DeparturePoint> points = departurePointRepository.findAll();
        List<Airline> carriers = airlineRepository.findAll();
        int updated = 0;
        for (int i = 0; i < schedules.size(); i++) {
            TourSchedule schedule = schedules.get(i);
            if (schedule.getTransportMode() != null) {
                continue;
            }
            TransportMode mode = modes.get(i % modes.size());
            schedule.setTransportMode(mode);
            if (!points.isEmpty()) {
                schedule.setDeparturePoint(points.get(i % points.size()));
            }
            // Chỉ gán hãng bay khi phương tiện thực sự là máy bay
            schedule.setAirline(isAirTransport(mode) ? carriers.get(i % carriers.size()) : null);
            updated++;
        }
        if (updated > 0) {
            scheduleRepository.saveAll(schedules);
            log.info("DataSeeder: assigned transport info to {} schedules", updated);
        }
    }

    private boolean isAirTransport(TransportMode mode) {
        return mode != null && mode.getIcon() != null && mode.getIcon().toLowerCase().contains("plane");
    }

    private TransportMode ensureTransportMode(String name, String description, String icon) {
        return transportModeRepository
                .findByNameIgnoreCase(name)
                .orElseGet(() -> transportModeRepository.save(TransportMode.builder()
                        .name(name)
                        .description(description)
                        .icon(icon)
                        .status(ActiveStatus.ACTIVE)
                        .build()));
    }

    private DeparturePoint ensureDeparturePoint(String name, String city, String address) {
        return departurePointRepository
                .findByNameIgnoreCase(name)
                .orElseGet(() -> departurePointRepository.save(DeparturePoint.builder()
                        .name(name)
                        .city(city)
                        .address(address)
                        .status(ActiveStatus.ACTIVE)
                        .build()));
    }

    private Airline ensureAirline(String code, String name) {
        return airlineRepository
                .findByCodeIgnoreCase(code)
                .orElseGet(() -> airlineRepository.save(Airline.builder()
                        .code(code)
                        .name(name)
                        .status(ActiveStatus.ACTIVE)
                        .build()));
    }

    /**
     * Với mỗi tour chưa có schedule nào, tạo 3 lịch khởi hành mẫu
     * (cách nhau 14, 28, 42 ngày từ hôm nay).
     */
    private void seedSchedulesForToursWithout() {
        List<Tour> tours = tourRepository.findToursWithoutSchedules();
        if (tours.isEmpty()) {
            log.info("DataSeeder: all tours already have schedules => skip");
            return;
        }
        LocalDate today = LocalDate.now();
        int total = 0;
        for (Tour tour : tours) {
            int durationDays = tour.getDurationDays() != null ? tour.getDurationDays() : 1;
            int totalSeats = tour.getMaxPeople() != null ? tour.getMaxPeople() : 30;
            for (int offsetDays : new int[]{14, 28, 42}) {
                LocalDate departure = today.plusDays(offsetDays);
                TourSchedule schedule = TourSchedule.builder()
                        .tour(tour)
                        .departureDate(departure)
                        .returnDate(departure.plusDays(durationDays - 1L))
                        .totalSeats(totalSeats)
                        .availableSeats(totalSeats)
                        .status(ScheduleStatus.OPEN)
                        .build();
                scheduleRepository.save(schedule);
                total++;
            }
        }
        log.info("DataSeeder: created {} default schedules for {} tours", total, tours.size());
    }

    private Role ensureRole(RoleName name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role r = Role.builder().name(name).build();
                    return roleRepository.save(r);
                });
    }

    private void seedUserIfMissing(String email,
                                   String fullName,
                                   String rawPassword,
                                   Gender gender,
                                   String phone,
                                   String address,
                                   UserStatus status,
                                   Set<Role> roles) {
        if (userRepository.existsByEmail(email)) {
            log.info("DataSeeder: user {} already exists => skip", email);
            return;
        }
        User u = User.builder()
                .email(email)
                .fullName(fullName)
                .password(passwordEncoder.encode(rawPassword))
                .gender(gender)
                .phone(phone)
                .address(address)
                .status(status)
                .roles(new HashSet<>(roles))
                .build();
        userRepository.save(u);
        log.info("DataSeeder: created user {}", email);
    }
}
