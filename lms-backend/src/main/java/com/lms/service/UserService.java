package com.lms.service;

import com.lms.dto.request.UpdateProfileRequest;
import com.lms.dto.response.UserResponse;
import com.lms.entity.User;

import java.util.List;

public interface UserService {
    UserResponse getProfile(User currentUser);
    UserResponse updateProfile(User currentUser, UpdateProfileRequest request);
    List<UserResponse> getAllUsers();
    void deleteUser(Long userId);
}
