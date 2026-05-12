package com.project.commerce.payment.service;

import com.project.commerce.inventory.service.InventoryService;
import com.project.commerce.order.entity.Order;
import com.project.commerce.order.entity.OrderItem;
import com.project.commerce.payment.dto.PaymentCancelDTO;
import com.project.commerce.payment.dto.PaymentConfirmDTO;
import com.project.commerce.payment.dto.PaymentFailDTO;
import com.project.commerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;

    //  결제 성공
    @Transactional
    public void confirm(PaymentConfirmDTO dto) {

        tossConfirm(dto);

        String[] split = dto.getOrderId().split("_");

        Long realOrderId = Long.valueOf(split[1]);

        Order order = orderRepository.findById(realOrderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!"PENDING".equals(order.getStatus())) {
            throw new RuntimeException("이미 처리된 주문");
        }

        // confirm 처리
        for (OrderItem item : order.getItems()) {
            inventoryService.confirm(
                    item.getProduct().getId(),
                    item.getQuantity()
            );
        }

        order.setStatus("PAID");
        order.setPaymentKey(dto.getPaymentKey());
        order.setPaidAt(LocalDateTime.now());
    }

    //  결제 실패
    @Transactional
    public void fail(PaymentFailDTO dto) {

        String[] split = dto.getOrderId().split("_");

        Long realOrderId = Long.valueOf(split[1]);

        Order order = orderRepository.findById(realOrderId)
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!"PENDING".equals(order.getStatus())) return;

        //  reserve 취소
        for (OrderItem item : order.getItems()) {
            inventoryService.cancelReserve(
                    item.getProduct().getId(),
                    item.getQuantity()
            );
        }

        order.setStatus("FAILED");
    }

    @Transactional
    public void cancel(PaymentCancelDTO dto) {

        // 1. Toss 결제 취소 API 호출
        tossCancel(dto.getPaymentKey(), dto.getCancelReason());

        // 2. 주문 찾기
        Order order = orderRepository.findByPaymentKey(dto.getPaymentKey())
                .orElseThrow(() -> new RuntimeException("주문 없음"));

        if (!"PAID".equals(order.getStatus())) {
            throw new RuntimeException("취소 불가능 상태");
        }

        // 3. 재고 rollback
        for (OrderItem item : order.getItems()) {
            inventoryService.cancelConfirm(
                    item.getProduct().getId(),
                    item.getQuantity()
            );
        }

        // 4. 상태 변경
        order.setStatus("CANCELLED");
    }

    private void tossConfirm(PaymentConfirmDTO dto) {
        System.out.println("--------------------토스 승인 시작--------------------");
        String secretKey =
                "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

        String encodedKey = Base64.getEncoder()
                .encodeToString(
                        (secretKey + ":")
                                .getBytes(StandardCharsets.UTF_8)
                );

        try {

            String response = WebClient.create(
                            "https://api.tosspayments.com"
                    )
                    .post()
                    .uri("/v1/payments/confirm")
                    .header(
                            "Authorization",
                            "Basic " + encodedKey
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "paymentKey", dto.getPaymentKey(),
                            "orderId", dto.getOrderId(),
                            "amount", dto.getAmount()
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            System.out.println("--------------------토스 승인 성공--------------------");
            System.out.println(response);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(
                    "토스 승인 실패"
            );
        }
    }


    private void tossCancel(String paymentKey, String reason) {
       
        System.out.println("--------------------토스 결제 취소 시작--------------------");
        String secretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

        String auth = Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes());

        Map<String, Object> body = new HashMap<>();
        body.put("cancelReason", reason);

        // cancelAmount 제거
        // 전액취소는 넣지 않는게 안전

        String response = WebClient.create("https://api.tosspayments.com")
                .post()
                .uri("/v1/payments/" + paymentKey + "/cancel")
                .header("Authorization", "Basic " + auth)
                .header("Content-Type", "application/json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        System.out.println("--------------------토스 결제 취소 성공--------------------");
        System.out.println(response);
    }

}