package com.finance.dashboard.dto.response;

import com.finance.dashboard.domain.enums.RecordType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySummaryResponse {

    private String category;
    private RecordType type;
    private BigDecimal total;
    private long recordCount;
    private double percentage;
}
