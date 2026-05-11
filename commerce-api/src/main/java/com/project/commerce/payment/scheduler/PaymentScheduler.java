package com.project.commerce.payment.scheduler;

import com.project.commerce.inventory.service.InventoryService;
import com.project.commerce.order.entity.Order;
import com.project.commerce.order.entity.OrderItem;
import com.project.commerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentScheduler {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    // 1분마다 실행
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expirePendingOrders() {

        // 5분 지난 시간 계산
        LocalDateTime target = LocalDateTime.now().minusMinutes(5);

        // PENDING + 5분 초과 주문 조회
        List<Order> orders =
                orderRepository
                        .findByStatusAndCreatedAtBefore(
                                "PENDING",
                                target
                        );

        for (Order order : orders) {

            log.info("결제 만료 주문: {}", order.getId());

            // reserve 복구
            for (OrderItem item : order.getItems()) {

                inventoryService.cancelReserve(
                        item.getProduct().getId(),
                        item.getQuantity()
                );
            }

            // 상태 변경
            order.setStatus("FAILED");
        }
    }
}