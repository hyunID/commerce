package com.project.commerce.inventory.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryRequestDTO {

    private Long productId;
    private int quantity;
}