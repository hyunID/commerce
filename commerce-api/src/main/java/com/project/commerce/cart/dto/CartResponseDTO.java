package com.project.commerce.cart.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CartResponseDTO {

    private Long cartId;
    private List<Item> items;

    @Getter
    @Builder
    public static class Item {
        private Long cartItemId;
        private Long productId;
        private String productName;
        private int price;
        private int quantity;
    }
}