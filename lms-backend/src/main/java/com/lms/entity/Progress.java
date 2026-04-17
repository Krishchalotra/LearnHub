package com.lms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "lesson_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Progress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    private boolean completed;

    private LocalDateTime completedAt;

    public void markCompleted() {
        this.completed = true;
        this.completedAt = LocalDateTime.now();
    }
}
