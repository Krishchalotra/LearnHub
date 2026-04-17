package com.lms.controller;

import com.lms.dto.response.ApiResponse;
import com.lms.dto.response.CourseResponse;
import com.lms.entity.User;
import com.lms.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enroll")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> enroll(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {
        enrollmentService.enroll(courseId, user);
        return ResponseEntity.ok(ApiResponse.ok("Enrolled successfully", null));
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Void>> unenroll(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {
        enrollmentService.unenroll(courseId, user);
        return ResponseEntity.ok(ApiResponse.ok("Unenrolled successfully", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getMyEnrollments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.getEnrolledCourses(user)));
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<ApiResponse<Boolean>> checkEnrollment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.ok(enrollmentService.isEnrolled(courseId, user)));
    }
}
