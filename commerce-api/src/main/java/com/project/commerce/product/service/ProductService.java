package com.project.commerce.product.service;

import com.project.commerce.inventory.entity.Inventory;
import com.project.commerce.inventory.repository.InventoryRepository;
import com.project.commerce.product.dto.ProductRequestDTO;
import com.project.commerce.product.dto.ProductResponseDTO;
import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.ProductRepository;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    @Transactional
    public void create(ProductRequestDTO dto, MultipartFile image) {

        // 1. 이미지 저장
        String imageUrl = saveImage(image);

        // 2. 상품 생성
        Product p = new Product();
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());
        p.setImageUrl(imageUrl);

        p.setStatus("SOLD_OUT");// 상태값 기본 재고 초기 0 생성 상품 값도 SOLD_OUT 상태로 생성.
        productRepository.save(p);

        System.out.println(" create =" + p);

        // 3. 재고 자동 생성
        inventoryRepository.findByProductId(p.getId())
                .orElseGet(() -> {
                    Inventory inv = new Inventory();
                    inv.setProductId(p.getId());
                    inv.setStock(0);      // 초기값
                    inv.setReserved(0);
                    return inventoryRepository.save(inv);
                });
    }

    /*public List<Product> getAll() {
        return productRepository.findAll();
    }*/


    // 전체 조회 (삭제 제외)
    public List<ProductResponseDTO> getAll() {
        return productRepository.findAll()
                .stream()
                .filter(p -> !"DELETED".equals(p.getStatus()))
                .map(this::toDto)
                .toList();
    }

    // 관리자용 전체 조회 (삭제 포함)
    public List<ProductResponseDTO> getAllAdmin() {
        return productRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }


    @Transactional
    public void update(Long id, ProductRequestDTO dto, MultipartFile image) {
        Product p = productRepository.findById(id)
                .orElseThrow();
        System.out.println(" update id ="+ id);
        System.out.println(" getName() ="+ dto.getName());
        System.out.println(" getPrice() ="+ dto.getPrice());
        System.out.println(" getDescription ="+ dto.getDescription());

        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());

        // 이미지 수정 처리
        if (image != null && !image.isEmpty()) {

            // 기존 파일 삭제
            if (p.getImageUrl() != null) {
                File oldFile = new File(uploadDir + p.getImageUrl());
                if (oldFile.exists()) {
                    oldFile.delete();
                }
            }

            // 새 이미지 저장
            String newImage = saveImage(image);
            p.setImageUrl(newImage);
        }
    }

    @Transactional
    public void delete(Long id) {
        System.out.println(" delete id ="+ id);

        Product p = productRepository.findById(id)
                .orElseThrow();
        p.setStatus("DELETED"); // 물리삭제 → 상태삭제

        //productRepository.deleteById(id);
    }

    @Value("${file.upload-dir}")
    private String uploadDir;
    public String saveImage(MultipartFile file) {

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        File target = new File(uploadDir + fileName);

        try {
            file.transferTo(target);
        } catch (java.io.IOException e) {
            throw new RuntimeException("이미지 저장 실패", e);
        }


        return fileName;
    }


    private ProductResponseDTO toDto(Product p) {


        Inventory inv = inventoryRepository
                .findByProductId(p.getId())
                .orElse(null);

        // 실제 총 재고
        int stock = inv != null
                ? inv.getStock()
                : 0;

        // 예약 재고
        int reserved = inv != null
                ? inv.getReserved()
                : 0;

        // 구매 가능 재고
        int availableStock = stock - reserved;


        System.out.println("----------------------");
        System.out.println("stock ="+stock);
        System.out.println("reserved ="+reserved);
        System.out.println("availableStock ="+availableStock);
        System.out.println("----------------------");

        return new ProductResponseDTO(
                p.getId(),
                p.getName(),
                p.getPrice(),
                p.getDescription(),
                p.getImageUrl(),
                p.getStatus(),
                stock,
                reserved,
                availableStock
        );
    }


}