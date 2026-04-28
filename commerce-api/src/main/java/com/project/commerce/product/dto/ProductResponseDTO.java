package com.project.commerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProductResponseDTO {

    private Long id;
    private String name;
    private int price;
    private String description;
    private String imageUrl;

}