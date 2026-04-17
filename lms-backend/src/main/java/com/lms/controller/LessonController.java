package com.lms.controller;

import com.lms.dto.request.LessonRequest;
import com.lms.dto.response.ApiResponse;
import com.lms.dto.response.LessonResponse;
import com.lms.entity.User;
import com.lms.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;

    @GetMapping("/courses/{courseId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessons(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(lessonService.getLessonsByCourse(courseId, user)));
    }

    @PostMapping("/courses/{courseId}/lessons")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<LessonResponse>> addLesson(
            @PathVariable Long courseId,
            @Valid @RequestBody LessonRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Lesson added", lessonService.addLesson(courseId, request, user)));
    }

    @PutMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<LessonResponse>> updateLesson(
            @PathVariable Long lessonId,
            @Valid @RequestBody LessonRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok("Lesson updated", lessonService.updateLesson(lessonId, request, user)));
    }

    @DeleteMapping("/lessons/{lessonId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR','ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal User user) {
        lessonService.deleteLesson(lessonId, user);
        return ResponseEntity.ok(ApiResponse.ok("Lesson deleted", null));
    }
}
