package com.project.commerce.product.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductRequestDTO {

    private String name;
    private int price;
    private String description;

}