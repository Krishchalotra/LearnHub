package com.lms.service;

import com.lms.dto.response.CourseResponse;
import com.lms.entity.User;

import java.util.List;

public interface EnrollmentService {
    void enroll(Long courseId, User student);
    void unenroll(Long courseId, User student);
    List<CourseResponse> getEnrolledCourses(User student);
    boolean isEnrolled(Long courseId, User student);
}
