package com.project.commerce.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentCancelDTO {
    private String paymentKey;
    private String cancelReason;
    private int cancelAmount;
}
