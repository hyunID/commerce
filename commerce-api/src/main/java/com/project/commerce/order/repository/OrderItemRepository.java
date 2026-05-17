package com.project.commerce.order.repository;

import com.project.commerce.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
        select oi
        from OrderItem oi
        join oi.order o
        where o.user.id = :userId
        and oi.product.id = :productId
        and o.status = 'PAID'
        order by o.createdAt desc, oi.id desc
    """)
    List<OrderItem> findPaidItemsByUserIdAndProductId(
            Long userId,
            Long productId
    );
}
