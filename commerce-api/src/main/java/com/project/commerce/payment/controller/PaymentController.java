package com.project.commerce.payment.controller;

import com.project.commerce.global.jwt.JwtUtil;
import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.order.dto.OrderRequestDTO;
import com.project.commerce.order.entity.Order;
import com.project.commerce.order.service.OrderService;
import com.project.commerce.payment.dto.PaymentConfirmDTO;
import com.project.commerce.payment.dto.PaymentFailDTO;
import com.project.commerce.payment.dto.PaymentCancelDTO;
import com.project.commerce.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    //  직접 주문
    @PostMapping("/request")
    public ApiResponse<?> requestPayment(
            @RequestHeader("Authorization") String token,
            @RequestBody OrderRequestDTO dto
    ) {
        System.out.println("----------requestPayment start----------");
        Long userId = jwtUtil.getUserId(token);

        Order order = orderService.createDirectOrder(userId, dto); // PENDING + reserve

        System.out.println("----------requestPayment order----------");
        System.out.println(order);
        System.out.println(order.getId().toString());
        System.out.println(order.getTotalPrice());
        System.out.println("상품 결제");

        return ApiResponse.success(Map.of(
                "orderId", "ORDER_"+order.getId().toString() + "_" + System.currentTimeMillis(),
                "amount", order.getTotalPrice(),
                "orderName", "상품 결제"
        ));
    }

    // 장바구니 주문
    @PostMapping("/request/cart")
    public ApiResponse<?> requestCartPayment(
            @RequestHeader("Authorization") String token
    ) {

        System.out.println("----------requestCartPayment start----------");
        Long userId = jwtUtil.getUserId(token);

        Order order = orderService.createOrderFromCart(userId);

        System.out.println("----------requestCartPayment order----------");
        System.out.println(order);

        return ApiResponse.success(Map.of(
                "orderId", "ORDER_"+order.getId().toString() + "_" + System.currentTimeMillis(),
                "amount", order.getTotalPrice(),
                "orderName", "장바구니 결제"
        ));
    }

    // 결제 성공
    @PostMapping("/confirm")
    public ApiResponse<?> confirm(@RequestBody PaymentConfirmDTO dto) {

        System.out.println("----------requestCartPayment confirm----------");
        System.out.println(dto);

        paymentService.confirm(dto);

        return ApiResponse.success(null);
    }

    // 결제 실패
    @PostMapping("/fail")
    public ApiResponse<?> fail(@RequestBody PaymentFailDTO dto) {

        System.out.println("----------requestCartPayment fail----------");
        System.out.println(dto);
        paymentService.fail(dto);

        return ApiResponse.success(null);
    }

    @PostMapping("/cancel")
    public ApiResponse<?> cancel(@RequestBody PaymentCancelDTO dto) {
        paymentService.cancel(dto);
        return ApiResponse.success(null);
    }

}
