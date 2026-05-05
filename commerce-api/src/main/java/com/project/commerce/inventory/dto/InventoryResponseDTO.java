package com.project.commerce.inventory.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InventoryResponseDTO {

    private Long productId;
    private String productName;
    private int stock;
    private int reserved;
    private int available;


}