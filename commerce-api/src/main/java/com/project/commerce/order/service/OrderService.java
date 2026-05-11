package com.project.commerce.order.service;

import com.project.commerce.cart.entity.Cart;
import com.project.commerce.cart.entity.CartItem;
import com.project.commerce.cart.repository.CartRepository;
import com.project.commerce.inventory.service.InventoryService;
import com.project.commerce.order.dto.OrderItemDTO;
import com.project.commerce.order.dto.OrderRequestDTO;
import com.project.commerce.order.dto.OrderResponseDTO;
import com.project.commerce.order.entity.Order;
import com.project.commerce.order.entity.OrderItem;
import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.OrderRepository;
import com.project.commerce.repository.ProductRepository;
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
    private final CartRepository cartRepository;
    private final InventoryService inventoryService;

    /*
     =========================================================
      장바구니 주문 생성
      - 주문 상태 : PENDING
      - reserve 처리만 수행
      - 실제 재고 차감(confirm)은 결제 성공 시 PaymentService에서 처리
     =========================================================
    */
    @Transactional
    public Order createOrderFromCart(Long userId) {

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("장바구니 없음"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("장바구니 비어있음");
        }

        Order order = new Order();

        order.setUserId(userId);

        // 결제 대기 상태
        order.setStatus("PENDING");

        int totalPrice = 0;

        for (CartItem item : cart.getItems()) {

            Product product = item.getProduct();

            /*
             =========================================================
              기존 방식
              주문 생성 시 reserve + confirm 둘 다 수행

              문제:
              결제 전인데 실제 재고가 차감됨
             =========================================================
            */

            /*
            inventoryService.reserve(product.getId(), item.getQuantity());
            inventoryService.confirm(product.getId(), item.getQuantity());
            */

            /*
             =========================================================
              변경 방식
              reserve만 수행

              실제 재고 차감(confirm)은
              결제 성공 시 PaymentService.confirm() 에서 수행
             =========================================================
            */
            inventoryService.reserve(
                    product.getId(),
                    item.getQuantity()
            );

            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            totalPrice += product.getPrice() * item.getQuantity();

            order.addItem(orderItem);
        }

        order.setTotalPrice(totalPrice);

        orderRepository.save(order);

        /*
         =========================================================
          장바구니 비우기

          현재는 주문 생성 시 비움
          실무에서는 결제 성공(PAID) 시점에 비우는 경우 많음

          현재 구조 유지
         =========================================================
        */
        cart.getItems().clear();

        return order;
    }

    /*
     =========================================================
      바로 구매 (상세페이지 구매)

      상세페이지에서도 수량 선택 가능하므로
      createDirectOrder 이름 유지

      - 주문 상태 : PENDING
      - reserve만 수행
      - 실제 차감(confirm)은 결제 성공 시 수행
     =========================================================
    */
    @Transactional
    public Order createDirectOrder(Long userId, OrderRequestDTO dto) {

        Order order = new Order();

        order.setUserId(userId);

        // 결제 대기 상태
        order.setStatus("PENDING");

        int totalPrice = 0;

        for (OrderItemDTO item : dto.getItems()) {

            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("상품 없음"));

            /*
             =========================================================
              기존 즉시 차감 방식
              결제 전인데 실제 재고 차감됨
             =========================================================
            */

            /*
            inventoryService.reserve(product.getId(), item.getQuantity());
            inventoryService.confirm(product.getId(), item.getQuantity());
            */

            /*
             =========================================================
              변경 방식
              reserve만 수행
             =========================================================
            */
            inventoryService.reserve(
                    product.getId(),
                    item.getQuantity()
            );

            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(product.getPrice());

            totalPrice += product.getPrice() * item.getQuantity();

            order.addItem(orderItem);
        }

        order.setTotalPrice(totalPrice);

        return orderRepository.save(order);
    }

    /*
     =========================================================
      주문 취소

      PENDING
      → reserve 해제(cancelReserve)

      PAID
      → 실제 재고 복구(restore)
     =========================================================
    */
    @Transactional
    public void cancelOrder(Long userId, Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!order.getUserId().equals(userId)) {
            throw new RuntimeException("권한 없음");
        }

        /*
         =========================================================
          결제 대기 상태 취소
          reserve만 해제
         =========================================================
        */
        if ("PENDING".equals(order.getStatus())) {

            for (OrderItem item : order.getItems()) {

                inventoryService.cancelReserve(
                        item.getProduct().getId(),
                        item.getQuantity()
                );
            }

            order.setStatus("CANCELLED");

            return;
        }

        /*
         =========================================================
          결제 완료 상태 취소
          실제 재고 복구
         =========================================================
        */
        if ("PAID".equals(order.getStatus())) {

            for (OrderItem item : order.getItems()) {

                inventoryService.restore(
                        item.getProduct().getId(),
                        item.getQuantity()
                );
            }

            order.setStatus("CANCELLED");

            return;
        }

        throw new RuntimeException("취소 불가능 상태");
    }

    // 내 주문 조회
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

    // 관리자 전체 조회
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



    // 주문 상태 조회 (polling용)
    @Transactional(readOnly = true)
    public String getOrderStatus(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        return order.getStatus();
    }
}