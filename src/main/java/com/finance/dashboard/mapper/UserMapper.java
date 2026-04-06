package com.finance.dashboard.mapper;

import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.dto.response.UserResponse;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);
}
