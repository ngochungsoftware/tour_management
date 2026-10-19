package com.travelgo.repository;

import com.travelgo.common.enums.UserStatus;
import com.travelgo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByResetToken(String resetToken);

    long countByStatus(UserStatus status);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"roles"})
    @Query("""
            SELECT u FROM User u
            WHERE (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
            """)
    Page<User> search(@Param("keyword") String keyword, Pageable pageable);
}
