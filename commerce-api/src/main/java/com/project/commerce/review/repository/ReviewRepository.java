package com.project.commerce.review.repository;

import com.project.commerce.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdAndDeletedFalseOrderByIdDesc(Long productId);

    Optional<Review> findByUserIdAndOrderItemIdAndDeletedFalse(
            Long userId,
            Long orderItemId
    );

    boolean existsByOrderItemIdAndDeletedFalse(Long orderItemId);

    List<Review> findByUserIdAndProductIdAndDeletedFalseOrderByIdDesc(
            Long userId,
            Long productId
    );
}