package com.project.commerce.review.dto;

import com.project.commerce.review.entity.Review;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MyReviewDTO {

    private Long id;
    private Long orderItemId;

    private int rating;
    private String content;

    public static MyReviewDTO from(Review review) {
        return MyReviewDTO.builder()
                .id(review.getId())
                .orderItemId(review.getOrderItemId())
                .rating(review.getRating())
                .content(review.getContent())
                .build();
    }
}