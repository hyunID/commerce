package com.project.commerce.product.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductResponseDTO {

    private Long id;
    private String name;
    private int price;
    private String description;
    private String imageUrl;
    private List<String> images;
    private String status;
    private int stock;
    private Integer reserved;
    private Integer availableStock;
    private String gender;
    private String category;

}