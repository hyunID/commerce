package com.project.commerce.review.service;

import com.project.commerce.order.entity.OrderItem;
import com.project.commerce.order.repository.OrderItemRepository;
import com.project.commerce.review.dto.*;
import com.project.commerce.review.entity.Review;
import com.project.commerce.review.repository.ReviewRepository;
import com.project.commerce.user.entity.User;
import com.project.commerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    // 상품 리뷰 전체 조회
    @Transactional(readOnly = true)
    public List<ReviewResponseDTO> getProductReviews(
            Long productId,
            Long loginUserId
    ) {

        return reviewRepository
                .findByProductIdAndDeletedFalseOrderByIdDesc(productId)
                .stream()
                .map(review -> {

                    User user = userRepository.findById(review.getUserId())
                            .orElseThrow(() -> new RuntimeException("사용자 없음"));

                    return ReviewResponseDTO.builder()
                            .id(review.getId())
                            .userId(review.getUserId())
                            .productId(review.getProductId())
                            .orderItemId(review.getOrderItemId())
                            .writer(user.getName())
                            .rating(review.getRating())
                            .content(review.getContent())
                            .mine(review.getUserId().equals(loginUserId))
                            .createdAt(review.getCreatedAt())
                            .updatedAt(review.getUpdatedAt())
                            .build();
                })
                .toList();
    }

    // 리뷰 작성 가능 여부 조회
    @Transactional(readOnly = true)
    public ReviewPermissionDTO getReviewPermission(
            Long productId,
            Long userId
    ) {

        List<OrderItem> paidItems =
                orderItemRepository.findPaidItemsByUserIdAndProductId(
                        userId,
                        productId
                );

        if (paidItems.isEmpty()) {
            return ReviewPermissionDTO.builder()
                    .canWrite(false)
                    .message("구매 이력이 없습니다.")
                    .build();
        }

        // 최신 구매건부터 아직 리뷰 안 쓴 orderItem 찾기
        for (OrderItem item : paidItems) {

            boolean alreadyReviewed =
                    reviewRepository.existsByOrderItemIdAndDeletedFalse(
                            item.getId()
                    );

            if (!alreadyReviewed) {
                return ReviewPermissionDTO.builder()
                        .canWrite(true)
                        .orderItemId(item.getId())
                        .lastPurchasedAt(item.getOrder().getCreatedAt())
                        .message("리뷰 작성 가능")
                        .build();
            }
        }

        // 모든 구매건에 리뷰를 이미 작성한 경우, 가장 최근 내 리뷰 반환
        Review myReview =
                reviewRepository
                        .findByUserIdAndProductIdAndDeletedFalseOrderByIdDesc(
                                userId,
                                productId
                        )
                        .stream()
                        .findFirst()
                        .orElse(null);

        return ReviewPermissionDTO.builder()
                .canWrite(false)
                .myReview(
                        myReview != null
                                ? MyReviewDTO.from(myReview)
                                : null
                )
                .message("이미 리뷰를 작성했습니다.")
                .build();
    }

    // 리뷰 작성
    @Transactional
    public void create(
            Long productId,
            Long userId,
            ReviewCreateDTO dto
    ) {

        validateRating(dto.getRating());

        ReviewPermissionDTO permission =
                getReviewPermission(productId, userId);

        if (!permission.isCanWrite()) {
            throw new RuntimeException(permission.getMessage());
        }

        Long orderItemId = permission.getOrderItemId();

        if (reviewRepository.existsByOrderItemIdAndDeletedFalse(orderItemId)) {
            throw new RuntimeException("이미 리뷰를 작성한 주문상품입니다.");
        }

        Review review = new Review();
        review.setUserId(userId);
        review.setProductId(productId);
        review.setOrderItemId(orderItemId);
        review.setRating(dto.getRating());
        review.setContent(dto.getContent());
        review.setDeleted(false);

        reviewRepository.save(review);
    }

    // 리뷰 수정
    @Transactional
    public void update(
            Long reviewId,
            Long userId,
            ReviewUpdateDTO dto
    ) {

        validateRating(dto.getRating());

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

        if (review.isDeleted()) {
            throw new RuntimeException("삭제된 리뷰입니다.");
        }

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("본인 리뷰만 수정 가능합니다.");
        }

        review.setRating(dto.getRating());
        review.setContent(dto.getContent());
    }

    // 리뷰 삭제
    @Transactional
    public void delete(
            Long reviewId,
            Long userId
    ) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰 없음"));

        if (review.isDeleted()) {
            throw new RuntimeException("이미 삭제된 리뷰입니다.");
        }

        if (!review.getUserId().equals(userId)) {
            throw new RuntimeException("본인 리뷰만 삭제 가능합니다.");
        }

        review.setDeleted(true);
    }

    private void validateRating(int rating) {

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("별점은 1점 이상 5점 이하만 가능합니다.");
        }
    }

    @Transactional(readOnly = true)
    public OrderItemReviewStatusDTO getOrderItemReviewStatus(
            Long orderItemId,
            Long userId
    ) {

        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("주문 상품 없음"));

        if (!item.getOrder().getUser().getId().equals(userId)) {
            throw new RuntimeException("본인 주문 상품만 조회 가능합니다.");
        }

        if (!"PAID".equals(item.getOrder().getStatus())) {
            return OrderItemReviewStatusDTO.builder()
                    .orderItemId(orderItemId)
                    .reviewed(false)
                    .canWrite(false)
                    .message("결제 완료된 주문만 리뷰 작성 가능합니다.")
                    .build();
        }

        boolean reviewed =
                reviewRepository.existsByOrderItemIdAndDeletedFalse(orderItemId);

        return OrderItemReviewStatusDTO.builder()
                .orderItemId(orderItemId)
                .reviewed(reviewed)
                .canWrite(!reviewed)
                .message(
                        reviewed
                                ? "리뷰 완료"
                                : "리뷰 작성 가능"
                )
                .build();
    }


}