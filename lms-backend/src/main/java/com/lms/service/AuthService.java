package com.lms.service;

import com.lms.dto.request.LoginRequest;
import com.lms.dto.request.RegisterRequest;
import com.lms.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
