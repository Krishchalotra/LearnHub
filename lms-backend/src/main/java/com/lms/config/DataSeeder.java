package com.lms.config;

import com.lms.entity.*;
import com.lms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepo,
            CourseRepository courseRepo,
            LessonRepository lessonRepo,
            EnrollmentRepository enrollmentRepo) {
        return args -> {
            if (userRepo.count() > 0) return;

            // Users
            User admin = userRepo.save(User.builder()
                    .name("Admin User").email("admin@lms.com")
                    .password(passwordEncoder.encode("password")).role(Role.ADMIN).build());

            User instructor = userRepo.save(User.builder()
                    .name("Jane Smith").email("instructor@lms.com")
                    .password(passwordEncoder.encode("password")).role(Role.INSTRUCTOR)
                    .bio("Senior Software Engineer with 10 years of experience").build());

            User student = userRepo.save(User.builder()
                    .name("John Doe").email("student@lms.com")
                    .password(passwordEncoder.encode("password")).role(Role.STUDENT).build());

            // Courses
            Course c1 = courseRepo.save(Course.builder()
                    .title("Spring Boot Masterclass").description("Complete Spring Boot from zero to hero")
                    .category("Backend").level("BEGINNER").price(49.99).instructor(instructor)
                    .thumbnailUrl("https://placehold.co/400x225/6366f1/white?text=Spring+Boot").build());

            Course c2 = courseRepo.save(Course.builder()
                    .title("React & TypeScript").description("Build modern UIs with React and TypeScript")
                    .category("Frontend").level("INTERMEDIATE").price(39.99).instructor(instructor)
                    .thumbnailUrl("https://placehold.co/400x225/06b6d4/white?text=React+TS").build());

            Course c3 = courseRepo.save(Course.builder()
                    .title("System Design Fundamentals").description("Learn to design scalable distributed systems")
                    .category("Architecture").level("ADVANCED").price(59.99).instructor(instructor)
                    .thumbnailUrl("https://placehold.co/400x225/f59e0b/white?text=System+Design").build());

            // Lessons for c1
            for (int i = 1; i <= 5; i++) {
                lessonRepo.save(Lesson.builder()
                        .title("Lesson " + i + ": " + (i == 1 ? "Introduction" : i == 2 ? "Spring Core" : i == 3 ? "REST APIs" : i == 4 ? "Security" : "Deployment"))
                        .content("Content for lesson " + i).videoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
                        .duration(15 + i * 5).orderIndex(i).course(c1).build());
            }

            // Lessons for c2
            for (int i = 1; i <= 4; i++) {
                lessonRepo.save(Lesson.builder()
                        .title("Lesson " + i + ": " + (i == 1 ? "React Basics" : i == 2 ? "Hooks Deep Dive" : i == 3 ? "TypeScript" : "State Management"))
                        .content("Content for lesson " + i).videoUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")
                        .duration(20 + i * 5).orderIndex(i).course(c2).build());
            }

            // Enroll student
            enrollmentRepo.save(Enrollment.builder().student(student).course(c1).build());
            enrollmentRepo.save(Enrollment.builder().student(student).course(c2).build());

            log.info("Seed data loaded. Login: admin@lms.com / instructor@lms.com / student@lms.com (password: password)");
        };
    }
}
