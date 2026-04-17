package com.lms.service.impl;

import com.lms.dto.response.ProgressResponse;
import com.lms.entity.Lesson;
import com.lms.entity.Progress;
import com.lms.entity.User;
import com.lms.exception.ResourceNotFoundException;
import com.lms.repository.LessonRepository;
import com.lms.repository.ProgressRepository;
import com.lms.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;

    @Override
    @Transactional
    public void markLessonCompleted(Long lessonId, User student) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", lessonId));

        Progress progress = progressRepository
                .findByStudentIdAndLessonId(student.getId(), lessonId)
                .orElse(Progress.builder().student(student).lesson(lesson).build());

        progress.markCompleted();
        progressRepository.save(progress);
    }

    @Override
    public ProgressResponse getCourseProgress(Long courseId, User student) {
        long total = lessonRepository.countByCourseId(courseId);
        long completed = progressRepository.countCompletedByStudentAndCourse(student, courseId);
        double percentage = total == 0 ? 0 : Math.round((completed * 100.0 / total) * 10.0) / 10.0;

        return ProgressResponse.builder()
                .courseId(courseId)
                .totalLessons((int) total)
                .completedLessons(completed)
                .percentage(percentage)
                .build();
    }
}
