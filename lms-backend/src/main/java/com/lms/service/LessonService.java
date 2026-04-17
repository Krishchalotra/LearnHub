package com.lms.service;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.User;

import java.util.List;

public interface LessonService {
    LessonResponse addLesson(Long courseId, LessonRequest request, User currentUser);
    LessonResponse updateLesson(Long lessonId, LessonRequest request, User currentUser);
    void deleteLesson(Long lessonId, User currentUser);
    List<LessonResponse> getLessonsByCourse(Long courseId, User currentUser);
}
