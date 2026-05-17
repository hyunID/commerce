package com.project.commerce.review.controller;

import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.review.dto.ReviewCreateDTO;
import com.project.commerce.review.dto.ReviewUpdateDTO;
import com.project.commerce.review.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // 리뷰 조회
    @GetMapping("/product/{productId}")
    public ApiResponse<?> getProductReviews(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {

        Long userId = (Long) request.getAttribute("userId");

        return ApiResponse.success(
                reviewService.getProductReviews(
                        productId,
                        userId
                )
        );
    }

    // 리뷰 작성 가능 여부
    @GetMapping("/product/{productId}/permission")
    public ApiResponse<?> getReviewPermission(
            @PathVariable Long productId,
            HttpServletRequest request
    ) {

        Long userId = (Long) request.getAttribute("userId");

        return ApiResponse.success(
                reviewService.getReviewPermission(
                        productId,
                        userId
                )
        );
    }

    // 리뷰 작성
    @PostMapping("/product/{productId}")
    public ApiResponse<?> create(
            @PathVariable Long productId,
            @RequestBody ReviewCreateDTO dto,
            HttpServletRequest request
    ) {

        Long userId = (Long) request.getAttribute("userId");

        reviewService.create(
                productId,
                userId,
                dto
        );

        return ApiResponse.success(null);
    }

    // 리뷰 수정
    @PutMapping("/{reviewId}")
    public ApiResponse<?> update(
            @PathVariable Long reviewId,
            @RequestBody ReviewUpdateDTO dto,
            HttpServletRequest request
    ) {

        Long userId = (Long) request.getAttribute("userId");

        reviewService.update(
                reviewId,
                userId,
                dto
        );

        return ApiResponse.success(null);
    }

    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ApiResponse<?> delete(
            @PathVariable Long reviewId,
            HttpServletRequest request
    ) {

        Long userId = (Long) request.getAttribute("userId");

        reviewService.delete(
                reviewId,
                userId
        );

        return ApiResponse.success(null);
    }

    // 주문 현황 페이지 리뷰 상태값
    @GetMapping("/order-item/{orderItemId}/status")
    public ApiResponse<?> getOrderItemReviewStatus(
            @PathVariable Long orderItemId,
            HttpServletRequest request
    ) {

        Long userId = (Long) request.getAttribute("userId");

        return ApiResponse.success(
                reviewService.getOrderItemReviewStatus(
                        orderItemId,
                        userId
                )
        );
    }
}