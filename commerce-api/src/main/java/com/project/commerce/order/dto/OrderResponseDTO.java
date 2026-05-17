package com.project.commerce.order.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class OrderResponseDTO {

    private Long id;
    private int totalPrice;
    private String status;
    private LocalDateTime createdAt;
    private String paymentKey;
    private List<Item> items;

    @Getter
    @Builder
    public static class Item {

        private Long orderItemId;

        private Long productId;
        private String productName;
        private String imageUrl;

        private int price;
        private int quantity;
    }
}