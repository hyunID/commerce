package com.project.commerce.inventory.service;

import com.project.commerce.inventory.dto.*;
import com.project.commerce.inventory.entity.Inventory;
import com.project.commerce.inventory.repository.InventoryRepository;
import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    // 초기 생성
    @Transactional
    public void create(InventoryCreateDTO dto) {

        Inventory inv = new Inventory();
        inv.setProductId(dto.getProductId());
        inv.setStock(dto.getStock());
        inv.setReserved(0);

        inventoryRepository.save(inv);
    }

    // 조회
    @Transactional(readOnly = true)
    public InventoryResponseDTO get(Long productId) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        return InventoryResponseDTO.builder()
                .productId(inv.getProductId())
                .stock(inv.getStock())
                .reserved(inv.getReserved())
                .available(inv.getAvailableStock())
                .build();
    }

    // 예약
    @Transactional
    public void reserve(Long productId, int qty) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        // 상태 체크
        if ("DELETED".equals(product.getStatus())) {
            throw new RuntimeException("삭제된 상품입니다.");
        }

        if ("SOLD_OUT".equals(product.getStatus())) {
            throw new RuntimeException("품절 상품입니다.");
        }

        // 재고 체크
        System.out.println("잔여 재고 =" +inv.getStock() );
        System.out.println("예약 주문 =" +inv.getReserved());

        int available = inv.getStock() - inv.getReserved();

        if (available <= 0) {
            throw new RuntimeException("품절 상품입니다.");
        }

        if (available < qty) {
            throw new RuntimeException("재고 부족");
        }

        inv.setReserved(inv.getReserved() + qty);

        updateProductStatus(inv);
    }

    //  확정
    @Transactional
    public void confirm(Long productId, int qty) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품 없음"));

        // 상태 체크
        if ("DELETED".equals(product.getStatus())) {
            throw new RuntimeException("삭제된 상품입니다.");
        }

        // 재고 체크
        System.out.println("직접 주문 잔여 재고=" +inv.getStock() );
        System.out.println("직접 주문 예약건=" +inv.getReserved());

        // 재고 재검증
        if (inv.getStock() < qty) {
            throw new RuntimeException("재고 부족");
        }

        // reserved 안전 체크
        if (inv.getReserved() < qty) {
            throw new RuntimeException("예약 수량 오류");
        }

        inv.setStock(inv.getStock() - qty);
        inv.setReserved(inv.getReserved() - qty);

        updateProductStatus(inv);
    }

    // 예약 취소
    @Transactional
    public void cancelReserve(Long productId, int qty) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        System.out.println("--------------------예약 취소--------------------");
        System.out.println("productId="+ productId);
        System.out.println(inv.getReserved());
        System.out.println(qty);
        // reserved 음수 방지
        if (inv.getReserved() < qty) {
            throw new RuntimeException("예약 수량 오류");
        }

        inv.setReserved(inv.getReserved() - qty);

        updateProductStatus(inv);
    }


    @Transactional
    public void cancelConfirm(Long productId, int qty) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));


        System.out.println("--------------------결재 취소--------------------");
        System.out.println("productId="+ productId);
        System.out.println(inv.getStock());
        System.out.println(qty);

        // PAID 상태 rollback = stock 복구
        inv.setStock(inv.getStock() + qty);

        updateProductStatus(inv);
    }


    // 관리자 수정
    @Transactional
    public void adjust(Long productId, InventoryAdjustDTO dto) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        inv.setStock(dto.getStock());
        inv.setReserved(dto.getReserved());

        updateProductStatus(inv);
    }

    // 삭제
    @Transactional
    public void delete(Long productId) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        inventoryRepository.delete(inv);
    }

    // 전체 조회
    @Transactional(readOnly = true)
    public List<InventoryResponseDTO> getAll() {

        return inventoryRepository.findAll()
                .stream()
                .map(inv -> {

                    Product product = productRepository.findById(inv.getProductId())
                            .orElseThrow();

                    return InventoryResponseDTO.builder()
                            .productId(inv.getProductId())
                            .productName(product.getName())
                            .stock(inv.getStock())
                            .reserved(inv.getReserved())
                            .available(inv.getAvailableStock())
                            .build();
                })
                .toList();
    }

    // 상품 상태값 변경
    private void updateProductStatus(Inventory inv) {

        Product product = productRepository.findById(inv.getProductId())
                .orElseThrow();

        // DELETED는 pass
        if ("DELETED".equals(product.getStatus())) {
            return;
        }

        int available = inv.getStock() - inv.getReserved();

        if (available <= 0) {
            product.setStatus("SOLD_OUT");
        } else {
            product.setStatus("ACTIVE");
        }

        System.out.println("updateProductStatus 상품 상태값 체크.");
        System.out.println(product.getStatus());
        productRepository.save(product);
    }


    @Transactional
    public void restore(Long productId, int qty) {

        Inventory inv = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("재고 없음"));

        inv.setStock(inv.getStock() + qty);

        updateProductStatus(inv);
    }




}