package com.finance.dashboard.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyTrendResponse {

    private String month;
    private BigDecimal income;
    private BigDecimal expenses;
    private BigDecimal net;
}
