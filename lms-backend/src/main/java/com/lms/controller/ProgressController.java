package com.lms.controller;

import com.lms.dto.response.ApiResponse;
import com.lms.dto.response.ProgressResponse;
import com.lms.entity.User;
import com.lms.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping("/lessons/{lessonId}/complete")
    public ResponseEntity<ApiResponse<Void>> markComplete(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal User user) {
        progressService.markLessonCompleted(lessonId, user);
        return ResponseEntity.ok(ApiResponse.ok("Lesson marked as completed", null));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<ApiResponse<ProgressResponse>> getCourseProgress(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(progressService.getCourseProgress(courseId, user)));
    }
}
