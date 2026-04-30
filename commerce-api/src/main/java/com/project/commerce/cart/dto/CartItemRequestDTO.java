package com.project.commerce.cart.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartItemRequestDTO {
    private Long productId;
    private int quantity;
}