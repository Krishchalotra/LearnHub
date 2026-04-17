package com.lms.service.impl;

import com.lms.dto.response.CourseResponse;
import com.lms.entity.Course;
import com.lms.entity.Enrollment;
import com.lms.entity.User;
import com.lms.exception.BadRequestException;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.CourseRepository;
import com.lms.repository.EnrollmentRepository;
import com.lms.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @Override
    @Transactional
    public void enroll(Long courseId, User student) {
        Course course = findCourseOrThrow(courseId);
        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new BadRequestException("Already enrolled in this course");
        }
        Enrollment enrollment = Enrollment.builder().student(student).course(course).build();
        enrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional
    public void unenroll(Long courseId, User student) {
        Course course = findCourseOrThrow(courseId);
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new BadRequestException("Not enrolled in this course"));
        enrollmentRepository.delete(enrollment);
    }

    @Override
    public List<CourseResponse> getEnrolledCourses(User student) {
        return enrollmentRepository.findByStudent(student).stream()
                .map(e -> CourseResponse.from(e.getCourse(),
                        enrollmentRepository.countByCourse(e.getCourse())))
                .toList();
    }

    @Override
    public boolean isEnrolled(Long courseId, User student) {
        Course course = findCourseOrThrow(courseId);
        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", id));
    }
}
