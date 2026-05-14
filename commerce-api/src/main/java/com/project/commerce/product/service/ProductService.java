package com.project.commerce.product.service;

import com.project.commerce.inventory.entity.Inventory;
import com.project.commerce.inventory.repository.InventoryRepository;
import com.project.commerce.product.dto.ProductRequestDTO;
import com.project.commerce.product.dto.ProductResponseDTO;
import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;


import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void create(ProductRequestDTO dto,
                       MultipartFile mainImage,
                       List<MultipartFile> subImages) {

        // 1. 이미지 저장
        String mainImageUrl = null;
        if (mainImage != null && !mainImage.isEmpty()) {
            mainImageUrl = saveImage(mainImage);
        }

        System.out.println(dto);
        System.out.println(dto.getName());
        System.out.println(dto.getPrice());
        System.out.println(dto.getGender());
        System.out.println(dto.getCategory());

        // 2. 상품 생성
        Product p = new Product();
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());
        p.setImageUrl(mainImageUrl);

        p.setGender(dto.getGender());
        p.setCategory(dto.getCategory());

        // 서브 이미지들 저장
        if (subImages != null) {
            List<String> imageList = new ArrayList<>();

            for (MultipartFile file : subImages) {
                if (!file.isEmpty()) {
                    imageList.add(saveImage(file));
                }
            }

            // DB JSON 저장 (현재 구조 유지)
            try {
                p.setImages(objectMapper.writeValueAsString(imageList));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

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

    // 전체 조회 (삭제 제외)
    public List<ProductResponseDTO> getAll() {
        return productRepository.findAll()
                .stream()
                .filter(p -> !"DELETED".equals(p.getStatus()))
                .map(this::toDto)
                .toList();
    }

    // 상품 상세 조회
    public ProductResponseDTO getDetail(Long id) {
        System.out.println(" ----------------------상세조회----------------------");
        System.out.println("  id ="+ id);
        Product p = productRepository.findById(id)
                .orElseThrow();

        // 삭제 상품 방지
        if ("DELETED".equals(p.getStatus())) {
            throw new RuntimeException("삭제된 상품입니다.");
        }

        return toDto(p);
    }

    // 관리자용 전체 조회 (삭제 포함)
    public List<ProductResponseDTO> getAllAdmin() {
        return productRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }


    @Transactional
    public void update(Long id, ProductRequestDTO dto, MultipartFile image,List<MultipartFile> images) {
        Product p = productRepository.findById(id)
                .orElseThrow();
        System.out.println(" update id ="+ id);
        System.out.println(" getName() ="+ dto.getName());
        System.out.println(" getPrice() ="+ dto.getPrice());
        System.out.println(" image ="+ image);
        System.out.println(" images ="+ images);


        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());
        p.setGender(dto.getGender());
        p.setCategory(dto.getCategory());

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

        // 2. 서브 이미지 수정 (추가)
        if (images != null && !images.isEmpty()) {

            List<String> imageList = new ArrayList<>();

            for (MultipartFile file : images) {
                imageList.add(saveImage(file));
            }

            try {
                p.setImages(objectMapper.writeValueAsString(imageList));
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
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

        List<String> images = List.of();

        try {

            if (p.getImages() != null) {

                images = objectMapper.readValue(
                        p.getImages(),
                        new TypeReference<List<String>>() {}
                );
            }

        } catch (Exception e) {
            e.printStackTrace();
        }


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
                images,
                p.getStatus(),
                stock,
                reserved,
                availableStock,
                p.getGender(),
                p.getCategory()
        );
    }


}