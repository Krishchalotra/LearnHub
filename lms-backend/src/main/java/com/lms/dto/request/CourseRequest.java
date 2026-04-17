package com.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank
    private String title;
    private String description;
    private String category;
    private String thumbnailUrl;
    private String level;
    private Double price;
}
