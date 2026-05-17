package com.project.commerce.review.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponseDTO {

    private Long id;
    private Long userId;
    private Long productId;
    private Long orderItemId;

    private String writer;

    private int rating;
    private String content;

    private boolean mine;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}