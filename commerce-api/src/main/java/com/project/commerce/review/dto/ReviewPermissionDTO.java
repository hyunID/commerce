package com.project.commerce.review.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewPermissionDTO {

    private boolean canWrite;

    private Long orderItemId;

    private MyReviewDTO myReview;

    private String message;

    private LocalDateTime lastPurchasedAt;
}