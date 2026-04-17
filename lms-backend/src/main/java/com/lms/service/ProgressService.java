package com.lms.service;

import com.lms.dto.response.ProgressResponse;
import com.lms.entity.User;

public interface ProgressService {
    void markLessonCompleted(Long lessonId, User student);
    ProgressResponse getCourseProgress(Long courseId, User student);
}
