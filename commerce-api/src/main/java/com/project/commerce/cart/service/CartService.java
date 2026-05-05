package com.project.commerce.cart.service;

import com.project.commerce.cart.dto.CartItemRequestDTO;
import com.project.commerce.cart.dto.CartResponseDTO;
import com.project.commerce.cart.entity.Cart;
import com.project.commerce.cart.entity.CartItem;
import com.project.commerce.cart.repository.CartItemRepository;
import com.project.commerce.cart.repository.CartRepository;
import com.project.commerce.inventory.entity.Inventory;
import com.project.commerce.inventory.repository.InventoryRepository;
import com.project.commerce.inventory.service.InventoryService;
import com.project.commerce.product.entity.Product;
import com.project.commerce.repository.ProductRepository;
import com.project.commerce.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final InventoryRepository inventoryRepository;

    // 생성
    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = new Cart();

                    User user = new User();
                    user.setId(userId);

                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    // 추가
    @Transactional
    public void addItem(Long userId, CartItemRequestDTO dto) {

        Cart cart = getOrCreateCart(userId);

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow();

        // 카트 추가시 재고 체크 안함 -> 주문시 재고 체크 하여 막음
        //inventoryService.reserve(product.getId(), dto.getQuantity());

        // 기존 상품 체크
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(product.getId())) {
                item.setQuantity(item.getQuantity() + dto.getQuantity());
                return;
            }
        }

        CartItem newItem = new CartItem();
        newItem.setProduct(product);
        newItem.setQuantity(dto.getQuantity());

        cart.addItem(newItem);
    }

    // 조회
    @Transactional(readOnly = true)
    public CartResponseDTO getCart(Long userId) {

        Cart cart = getOrCreateCart(userId);

        return CartResponseDTO.builder()
                .cartId(cart.getId())
                .items(cart.getItems().stream()
                        .map(i -> {

                            Inventory inv = inventoryRepository
                                    .findByProductId(i.getProduct().getId())
                                    .orElse(null);

                            int stock = inv != null ? inv.getStock() : 0;

                            return CartResponseDTO.Item.builder()
                                    .cartItemId(i.getId())
                                    .productId(i.getProduct().getId())
                                    .productName(i.getProduct().getName())
                                    .price(i.getProduct().getPrice())
                                    .quantity(i.getQuantity())
                                    .stock(stock)
                                    .build();
                        })
                        .collect(Collectors.toList()))
                .build();
    }

    // 수량 수정
    @Transactional
    public void updateItem(Long cartItemId, int quantity) {

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow();

        // 카트 수량 업데이트시 재고 체크 안함 -> 주문시 재고 체크 하여 막음
        /*int oldQty = item.getQuantity();
        Long productId = item.getProduct().getId();

        int diff = quantity - oldQty;

        if (diff > 0) {
            // 수량 증가 → 추가 예약
            inventoryService.reserve(productId, diff);
        } else if (diff < 0) {
            // 수량 감소 → 예약 해제
            inventoryService.cancelReserve(productId, Math.abs(diff));
        }*/


        item.setQuantity(quantity);
    }

    // 삭제
    @Transactional
    public void deleteItem(Long cartItemId) {

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow();

        // 카트 삭제시 재고 체크 안함 -> 주문시 재고 체크 하여 막음
        /*Long productId = item.getProduct().getId();
        int qty = item.getQuantity();
        inventoryService.cancelReserve(productId, qty);*/

        cartItemRepository.delete(item);
    }

    // 전체 비우기
    @Transactional
    public void clear(Long userId) {
        
        Cart cart = getOrCreateCart(userId);

        System.out.println("전체비우기");
        System.out.println(userId);
        System.out.println(cart);

        // 카트 삭제시 재고 체크 안함
        /*for (CartItem item : cart.getItems()) {
            inventoryService.cancelReserve(
                    item.getProduct().getId(),
                    item.getQuantity()
            );
        }*/

        cart.getItems().clear();
    }
}