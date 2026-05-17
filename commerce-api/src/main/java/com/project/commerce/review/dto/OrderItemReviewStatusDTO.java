package com.project.commerce.review.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OrderItemReviewStatusDTO {

    private Long orderItemId;

    private boolean reviewed;

    private boolean canWrite;

    private String message;
}