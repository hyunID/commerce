package com.project.commerce.product.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductRequestDTO {

    private String name;
    private int price;
    private String description;
    private String status;

    private String gender;   // MEN / WOMEN / UNISEX
    private String category; // TOP / BOTTOM / OUTER / SHOES
}