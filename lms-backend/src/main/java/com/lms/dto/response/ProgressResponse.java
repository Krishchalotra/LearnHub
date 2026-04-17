package com.lms.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class ProgressResponse {
    private Long courseId;
    private String courseTitle;
    private int totalLessons;
    private long completedLessons;
    private double percentage;
}
