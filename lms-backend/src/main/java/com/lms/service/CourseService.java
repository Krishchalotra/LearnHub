package com.lms.service;

import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import com.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CourseService {
    CourseResponse createCourse(CourseRequest request, User instructor);
    CourseResponse updateCourse(Long courseId, CourseRequest request, User currentUser);
    void deleteCourse(Long courseId, User currentUser);
    CourseResponse getCourseById(Long courseId);
    Page<CourseResponse> getAllCourses(String keyword, String category, Pageable pageable);
    List<CourseResponse> getMyCourses(User instructor);
}
