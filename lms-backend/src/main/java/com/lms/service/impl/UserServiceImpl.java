package com.lms.service.impl;

import com.lms.dto.request.UpdateProfileRequest;
import com.lms.dto.response.UserResponse;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.UserRepository;
import com.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getProfile(User currentUser) {
        return UserResponse.from(currentUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(User currentUser, UpdateProfileRequest request) {
        if (request.getName() != null) currentUser.setName(request.getName());
        if (request.getBio() != null) currentUser.setBio(request.getBio());
        if (request.getAvatarUrl() != null) currentUser.setAvatarUrl(request.getAvatarUrl());
        return UserResponse.from(userRepository.save(currentUser));
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(UserResponse::from).toList();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        userRepository.delete(user);
    }
}
