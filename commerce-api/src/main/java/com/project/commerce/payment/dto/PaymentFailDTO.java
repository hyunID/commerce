package com.project.commerce.payment.dto;

import lombok.Getter;

@Getter
public class PaymentFailDTO {
    private String orderId;
    private String message;
}