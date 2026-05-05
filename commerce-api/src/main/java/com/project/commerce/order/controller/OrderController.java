package com.project.commerce.order.controller;

import com.project.commerce.global.jwt.JwtUtil;
import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.order.dto.OrderRequestDTO;
import com.project.commerce.order.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final JwtUtil jwtUtil;

    // 장바구니 구매
    @PostMapping("/cart")
    public ApiResponse<?> orderFromCart(
            @RequestHeader("Authorization") String token
    ) {

        Long userId = jwtUtil.getUserId(token);

        orderService.createOrderFromCart(userId);

        return ApiResponse.success(null);
    }

    // 바로 구매
    @PostMapping("/direct")
    public ApiResponse<?> directOrder(
            @RequestHeader("Authorization") String token,
            @RequestBody OrderRequestDTO dto
    ) {

        Long userId = jwtUtil.getUserId(token);

        System.out.println(userId);
        System.out.println(dto);
        orderService.createDirectOrder(userId, dto);

        return ApiResponse.success(null);
    }

    // 내 주문 목록
    @GetMapping
    public ApiResponse<?> myOrders(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");

        return ApiResponse.success(orderService.getMyOrders(userId));
    }

    // 단건 조회
    @GetMapping("/{id}")
    public ApiResponse<?> get(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");

        return ApiResponse.success(orderService.getOrder(userId, id));
    }

    // 주문 취소
    @PutMapping("/{id}/cancel")
    public ApiResponse<?> cancel(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");

        orderService.cancelOrder(userId, id);
        return ApiResponse.success(null);
    }

    // 관리자 전체 조회
    @GetMapping("/admin")
    public ApiResponse<?> allOrders() {
        return ApiResponse.success(orderService.getAllOrders());
    }

    // 관리자 삭제
    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ApiResponse.success(null);
    }
}