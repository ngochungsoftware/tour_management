package com.travelgo.service;

import com.travelgo.dto.user.UserResponse;
import com.travelgo.entity.Role;
import com.travelgo.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", expression = "java(mapRoles(user))")
    UserResponse toResponse(User user);

    default java.util.Set<String> mapRoles(User user) {
        if (user.getRoles() == null) {
            return java.util.Set.of();
        }
        return user.getRoles().stream()
                .map(Role::getName)
                .map(Enum::name)
                .collect(Collectors.toSet());
    }
}
