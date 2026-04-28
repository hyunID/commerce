package com.project.commerce.product.controller;

import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.product.dto.ProductRequestDTO;
import com.project.commerce.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ApiResponse<?> create(
            @RequestPart("data") ProductRequestDTO dto,
            @RequestPart("image") MultipartFile image
    ) {
        productService.create(dto, image);
        return ApiResponse.success(null);
    }

    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success(productService.getAll());
    }

    @PutMapping("/{id}")
    public ApiResponse<?> update(
            @PathVariable Long id,
            @RequestBody ProductRequestDTO dto
    ) {
        productService.update(id, dto);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.success(null);
    }
}