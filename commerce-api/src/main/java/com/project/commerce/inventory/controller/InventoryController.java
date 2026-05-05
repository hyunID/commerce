package com.project.commerce.inventory.controller;

import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.inventory.dto.*;
import com.project.commerce.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // 생성
    @PostMapping
    public ApiResponse<?> create(@RequestBody InventoryCreateDTO dto) {
        inventoryService.create(dto);
        return ApiResponse.success(null);
    }

    // 전체 조회
    @GetMapping
    public ApiResponse<?> getAll() {
        return ApiResponse.success(inventoryService.getAll());
    }

    // 단건 조회
    @GetMapping("/{productId}")
    public ApiResponse<?> get(@PathVariable Long productId) {
        return ApiResponse.success(inventoryService.get(productId));
    }

    // 관리자 수정 (프론트랑 맞춤)
    @PutMapping("/{productId}/adjust")
    public ApiResponse<?> adjust(
            @PathVariable Long productId,
            @RequestBody InventoryAdjustDTO dto
    ) {
        inventoryService.adjust(productId, dto);
        return ApiResponse.success(null);
    }

    // 삭제
    @DeleteMapping("/{productId}")
    public ApiResponse<?> delete(@PathVariable Long productId) {
        inventoryService.delete(productId);
        return ApiResponse.success(null);
    }

    // 예약
//    @PutMapping("/{productId}/reserve")
//    public ApiResponse<?> reserve(
//            @PathVariable Long productId,
//            @RequestParam int qty
//    ) {
//        inventoryService.reserve(productId, qty);
//        return ApiResponse.success(null);
//    }

    // 확정
//    @PutMapping("/{productId}/confirm")
//    public ApiResponse<?> confirm(
//            @PathVariable Long productId,
//            @RequestParam int qty
//    ) {
//        inventoryService.confirm(productId, qty);
//        return ApiResponse.success(null);
//    }

    // 예약 취소
//    @PutMapping("/{productId}/cancel")
//    public ApiResponse<?> cancel(
//            @PathVariable Long productId,
//            @RequestParam int qty
//    ) {
//        inventoryService.cancelReserve(productId, qty);
//        return ApiResponse.success(null);
//    }




}