package com.project.commerce.inventory.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryAdjustDTO {
    private int stock;
    private int reserved;
}