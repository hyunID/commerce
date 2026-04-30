package com.project.commerce.order.service;

import com.project.commerce.order.dto.OrderRequestDTO;
import com.project.commerce.order.dto.OrderResponseDTO;
import com.project.commerce.order.dto.OrderItemDTO;
import com.project.commerce.order.entity.Order;
import com.project.commerce.order.entity.OrderItem;

import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.ProductRepository;
import com.project.commerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    // 생성
    @Transactional
    public void createOrder(Long userId, OrderRequestDTO dto) {

        Order order = new Order();
        order.setUserId(userId);
        order.setStatus("PENDING");

        int totalPrice = 0;

        for (OrderItemDTO item : dto.getItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow();

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            totalPrice += product.getPrice() * item.getQuantity();

            order.addItem(orderItem); // 🔥 중요
        }

        order.setTotalPrice(totalPrice);

        orderRepository.save(order);
    }

    // 내 주문 목록
    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getMyOrders(Long userId) {

        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 단건 조회
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long userId, Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("권한 없음");
        }

        return toDto(order);
    }

    // 주문 취소
    @Transactional
    public void cancelOrder(Long userId, Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow();

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("권한 없음");
        }

        if (!order.getStatus().equals("PENDING")) {
            throw new RuntimeException("이미 처리된 주문");
        }

        order.setStatus("CANCELLED");
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDTO> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // 관리자 삭제
    @Transactional
    public void deleteOrder(Long orderId) {
        orderRepository.deleteById(orderId);
    }

    // DTO 변환
    private OrderResponseDTO toDto(Order order) {

        return OrderResponseDTO.builder()
                .id(order.getId())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(order.getItems().stream()
                        .map(i -> OrderResponseDTO.Item.builder()
                                .productId(i.getProduct().getId())
                                .productName(i.getProduct().getName())
                                .price(i.getPrice())
                                .quantity(i.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}