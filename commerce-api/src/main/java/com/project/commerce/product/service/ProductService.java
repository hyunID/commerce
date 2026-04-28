package com.project.commerce.product.service;

import com.project.commerce.product.dto.ProductRequestDTO;
import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.ProductRepository;
import io.jsonwebtoken.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public void create(ProductRequestDTO dto, MultipartFile image) {

        String imageUrl = saveImage(image); // 임시

        Product p = new Product();
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());
        p.setImageUrl(imageUrl);

        productRepository.save(p);
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public void update(Long id, ProductRequestDTO dto) {
        Product p = productRepository.findById(id)
                .orElseThrow();

        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        p.setDescription(dto.getDescription());
    }

    public void delete(Long id) {
        productRepository.deleteById(id);
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

        // 🔥 풀경로 반환
        return uploadDir + fileName;
    }

}