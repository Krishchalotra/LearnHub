package com.lms.service.impl;

import com.lms.dto.request.CourseRequest;
import com.lms.dto.response.CourseResponse;
import com.lms.entity.Course;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.exception.UnauthorizedException;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Override
    @Transactional
    public CourseResponse createCourse(CourseRequest request, User instructor) {
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .thumbnailUrl(request.getThumbnailUrl())
                .level(request.getLevel())
                .price(request.getPrice())
                .instructor(instructor)
                .build();
        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public CourseResponse updateCourse(Long courseId, CourseRequest request, User currentUser) {
        Course course = findCourseOrThrow(courseId);
        assertOwnerOrAdmin(course, currentUser);

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setCategory(request.getCategory());
        course.setThumbnailUrl(request.getThumbnailUrl());
        course.setLevel(request.getLevel());
        course.setPrice(request.getPrice());

        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId, User currentUser) {
        Course course = findCourseOrThrow(courseId);
        assertOwnerOrAdmin(course, currentUser);
        courseRepository.delete(course);
    }

    @Override
    public CourseResponse getCourseById(Long courseId) {
        return toResponse(findCourseOrThrow(courseId));
    }

    @Override
    public Page<CourseResponse> getAllCourses(String keyword, String category, Pageable pageable) {
        Page<Course> courses;
        if (StringUtils.hasText(keyword)) {
            courses = courseRepository.search(keyword, pageable);
        } else if (StringUtils.hasText(category)) {
            courses = courseRepository.findByCategory(category, pageable);
        } else {
            courses = courseRepository.findAll(pageable);
        }
        return courses.map(this::toResponse);
    }

    @Override
    public List<CourseResponse> getMyCourses(User instructor) {
        return courseRepository.findByInstructor(instructor).stream().map(this::toResponse).toList();
    }

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", id));
    }

    private void assertOwnerOrAdmin(Course course, User user) {
        boolean isOwner = course.getInstructor() != null && course.getInstructor().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You don't have permission to modify this course");
        }
    }

    private CourseResponse toResponse(Course course) {
        long count = enrollmentRepository.countByCourse(course);
        return CourseResponse.from(course, count);
    }
}
