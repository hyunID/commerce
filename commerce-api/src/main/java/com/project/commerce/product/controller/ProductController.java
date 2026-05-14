package com.project.commerce.product.controller;

import com.project.commerce.global.response.ApiResponse;
import com.project.commerce.product.dto.ProductRequestDTO;
import com.project.commerce.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ApiResponse<?> create(
            @RequestPart("data") ProductRequestDTO dto,
            @RequestPart(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestPart(value = "subImages", required = false) List<MultipartFile> subImages
    ) {
        productService.create(dto, mainImage, subImages);
        return ApiResponse.success(null);
    }

    // 사용자용 상품  조회
    @GetMapping
    public ApiResponse<?> list() {
        return ApiResponse.success(productService.getAll());
    }

    //관리자용 상품 전체 조회
    @GetMapping("/admin")
    public ApiResponse<?> listAdmin() {
        return ApiResponse.success(productService.getAllAdmin());
    }

    // 상품 상세 조회
    @GetMapping("/{id}")
    public ApiResponse<?> detail(@PathVariable Long id) {
        return ApiResponse.success(
                productService.getDetail(id)
        );
    }

    // 상품 수정
    @PutMapping("/{id}")
    public ApiResponse<?> update(
            @PathVariable Long id,
            @RequestPart("data") ProductRequestDTO dto,
            @RequestPart(value = "mainImage", required = false)
            MultipartFile image,
            @RequestPart(value = "images", required = false)
            List<MultipartFile> images

    ) {

        System.out.println("id");
        System.out.println("_________________dto______________________");
        System.out.println(dto);

        productService.update(id, dto, image, images);
        return ApiResponse.success(null);
    }
    // 상품 삭제(상태값 변경)
    @DeleteMapping("/{id}")
    public ApiResponse<?> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.success(null);
    }
}