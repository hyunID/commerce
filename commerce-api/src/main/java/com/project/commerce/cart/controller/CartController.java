package com.project.commerce.cart.controller;

import com.project.commerce.cart.dto.CartItemRequestDTO;
import com.project.commerce.cart.service.CartService;
import com.project.commerce.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // 추가
    @PostMapping
    public ApiResponse<?> add(
            @RequestBody CartItemRequestDTO dto,
            HttpServletRequest request
    ) {
        Long userId = (Long) request.getAttribute("userId");
        cartService.addItem(userId, dto);
        return ApiResponse.success(null);
    }

    // 조회
    @GetMapping
    public ApiResponse<?> get(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ApiResponse.success(cartService.getCart(userId));
    }

    // 수량 수정
    @PutMapping("/{itemId}")
    public ApiResponse<?> update(
            @PathVariable Long itemId,
            @RequestParam int quantity
    ) {
        cartService.updateItem(itemId, quantity);
        return ApiResponse.success(null);
    }

    // 삭제
    @DeleteMapping("/{itemId}")
    public ApiResponse<?> delete(@PathVariable Long itemId) {
        cartService.deleteItem(itemId);
        return ApiResponse.success(null);
    }

    // 전체 삭제
    @DeleteMapping("/clear")
    public ApiResponse<?> clear(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        cartService.clear(userId);
        return ApiResponse.success(null);
    }
}