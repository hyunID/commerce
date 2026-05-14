package com.project.commerce.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Entity
@Table(name = "products")
@Getter @Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "ACTIVE"; // 상품 상태값 : ACTIVE(판매중),SOLD_OUT(품절),DELETED(삭제(숨김))

    private String imageUrl;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "json")
    private String images;

    private String gender;   // MEN / WOMEN / UNISEX
    private String category; // TOP / BOTTOM / OUTER / SHOES

}