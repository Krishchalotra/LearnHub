package com.lms.dto.response;

import com.lms.entity.Course;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String thumbnailUrl;
    private String level;
    private Double price;
    private String instructorName;
    private Long instructorId;
    private int lessonCount;
    private long enrollmentCount;
    private LocalDateTime createdAt;

    public static CourseResponse from(Course course, long enrollmentCount) {
        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .category(course.getCategory())
                .thumbnailUrl(course.getThumbnailUrl())
                .level(course.getLevel())
                .price(course.getPrice())
                .instructorName(course.getInstructor() != null ? course.getInstructor().getName() : null)
                .instructorId(course.getInstructor() != null ? course.getInstructor().getId() : null)
                .lessonCount(course.getLessons().size())
                .enrollmentCount(enrollmentCount)
                .createdAt(course.getCreatedAt())
                .build();
    }
}
