package com.travelgo.repository;

import com.travelgo.common.enums.RoleName;
import com.travelgo.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
