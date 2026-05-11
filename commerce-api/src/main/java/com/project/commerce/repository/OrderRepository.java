package com.project.commerce.repository;

import com.project.commerce.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByStatusAndCreatedAtBefore(
            String status,
            LocalDateTime time
    );
}
