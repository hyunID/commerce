package com.project.commerce.cart.service;

import com.project.commerce.cart.dto.CartItemRequestDTO;
import com.project.commerce.cart.dto.CartResponseDTO;
import com.project.commerce.cart.entity.Cart;
import com.project.commerce.cart.entity.CartItem;
import com.project.commerce.cart.repository.CartItemRepository;
import com.project.commerce.cart.repository.CartRepository;
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

    // 이름 변경 (핵심)
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
                        .map(i -> CartResponseDTO.Item.builder()
                                .cartItemId(i.getId())
                                .productId(i.getProduct().getId())
                                .productName(i.getProduct().getName())
                                .price(i.getProduct().getPrice())
                                .quantity(i.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    // 수량 수정 (정상 동작)
    @Transactional
    public void updateItem(Long cartItemId, int quantity) {

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow();

        item.setQuantity(quantity);
    }

    // 삭제 (정상 동작)
    @Transactional
    public void deleteItem(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    // 전체 비우기
    @Transactional
    public void clear(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
    }
}