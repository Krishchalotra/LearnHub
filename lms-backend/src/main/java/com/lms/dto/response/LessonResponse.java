package com.lms.dto.response;

import com.lms.entity.Lesson;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class LessonResponse {
    private Long id;
    private String title;
    private String content;
    private String videoUrl;
    private Integer duration;
    private Integer orderIndex;
    private Long courseId;
    private boolean completed;

    public static LessonResponse from(Lesson lesson, boolean completed) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .content(lesson.getContent())
                .videoUrl(lesson.getVideoUrl())
                .duration(lesson.getDuration())
                .orderIndex(lesson.getOrderIndex())
                .courseId(lesson.getCourse().getId())
                .completed(completed)
                .build();
    }
}
