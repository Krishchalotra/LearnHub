package com.lms.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private String avatarUrl;
}
