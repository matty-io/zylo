package com.zylo.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponseDto {

    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
    private UUID bookingId;
    private boolean mock;
}
