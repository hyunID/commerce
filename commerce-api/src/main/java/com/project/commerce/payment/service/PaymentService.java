package com.project.commerce.payment.service;

import com.project.commerce.inventory.service.InventoryService;
import com.project.commerce.order.entity.Order;
import com.project.commerce.order.entity.OrderItem;
import com.project.commerce.payment.dto.PaymentConfirmDTO;
import com.project.commerce.payment.dto.PaymentFailDTO;
import com.project.commerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    //  결제 성공
    @Transactional
    public void confirm(PaymentConfirmDTO dto) {

        String[] split = dto.getOrderId().split("_");

        Long realOrderId = Long.valueOf(split[1]);

        Order order = orderRepository.findById(realOrderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("이미 처리된 주문");
        }

        // confirm 처리
        for (OrderItem item : order.getItems()) {
            inventoryService.confirm(
                    item.getProduct().getId(),
                    item.getQuantity()
            );
        }

        order.setStatus("PAID");
    }

    //  결제 실패
    @Transactional
    public void fail(PaymentFailDTO dto) {

        String[] split = dto.getOrderId().split("_");

        Long realOrderId = Long.valueOf(split[1]);

        Order order = orderRepository.findById(realOrderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!"PENDING".equals(order.getStatus())) return;

        //  reserve 취소
        for (OrderItem item : order.getItems()) {
            inventoryService.cancelReserve(
                    item.getProduct().getId(),
                    item.getQuantity()
            );
        }

        order.setStatus("FAILED");
    }
}