package com.lms.service.impl;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.Course;
import com.lms.entity.Lesson;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.exception.UnauthorizedException;
import com.lms.repository.CourseRepository;
import com.lms.repository.LessonRepository;
import com.lms.repository.ProgressRepository;
import com.lms.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonRepository lessonRepository;
    private final CourseRepository courseRepository;
    private final ProgressRepository progressRepository;

    @Override
    @Transactional
    public LessonResponse addLesson(Long courseId, LessonRequest request, User currentUser) {
        Course course = findCourseOrThrow(courseId);
        assertInstructorOrAdmin(course, currentUser);

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .videoUrl(request.getVideoUrl())
                .duration(request.getDuration())
                .orderIndex(request.getOrderIndex())
                .course(course)
                .build();

        return LessonResponse.from(lessonRepository.save(lesson), false);
    }

    @Override
    @Transactional
    public LessonResponse updateLesson(Long lessonId, LessonRequest request, User currentUser) {
        Lesson lesson = findLessonOrThrow(lessonId);
        assertInstructorOrAdmin(lesson.getCourse(), currentUser);

        lesson.setTitle(request.getTitle());
        lesson.setContent(request.getContent());
        lesson.setVideoUrl(request.getVideoUrl());
        lesson.setDuration(request.getDuration());
        lesson.setOrderIndex(request.getOrderIndex());

        return LessonResponse.from(lessonRepository.save(lesson), false);
    }

    @Override
    @Transactional
    public void deleteLesson(Long lessonId, User currentUser) {
        Lesson lesson = findLessonOrThrow(lessonId);
        assertInstructorOrAdmin(lesson.getCourse(), currentUser);
        lessonRepository.delete(lesson);
    }

    @Override
    public List<LessonResponse> getLessonsByCourse(Long courseId, User currentUser) {
        return lessonRepository.findByCourseIdOrderByOrderIndex(courseId).stream()
                .map(lesson -> {
                    boolean completed = progressRepository
                            .findByStudentIdAndLessonId(currentUser.getId(), lesson.getId())
                            .map(p -> p.isCompleted())
                            .orElse(false);
                    return LessonResponse.from(lesson, completed);
                }).toList();
    }

    private Course findCourseOrThrow(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", id));
    }

    private Lesson findLessonOrThrow(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", id));
    }

    private void assertInstructorOrAdmin(Course course, User user) {
        boolean isOwner = course.getInstructor() != null && course.getInstructor().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You don't have permission to modify lessons in this course");
        }
    }
}
