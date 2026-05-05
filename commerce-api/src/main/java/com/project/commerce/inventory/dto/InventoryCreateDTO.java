package com.project.commerce.inventory.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryCreateDTO {
    private Long productId;
    private int stock;
}