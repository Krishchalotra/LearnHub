package com.lms.repository;

import com.lms.entity.Progress;
import com.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProgressRepository extends JpaRepository<Progress, Long> {
    Optional<Progress> findByStudentIdAndLessonId(Long studentId, Long lessonId);

    @Query("SELECT COUNT(p) FROM Progress p WHERE p.student = :student " +
           "AND p.lesson.course.id = :courseId AND p.completed = true")
    long countCompletedByStudentAndCourse(@Param("student") User student, @Param("courseId") Long courseId);

    List<Progress> findByStudentIdAndLessonCourseId(Long studentId, Long courseId);
}
