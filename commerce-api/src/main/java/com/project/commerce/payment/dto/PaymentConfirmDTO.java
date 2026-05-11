package com.project.commerce.payment.dto;

import lombok.Getter;

@Getter
public class PaymentConfirmDTO {
    private String orderId;
    private String paymentKey;
    private int amount;
}