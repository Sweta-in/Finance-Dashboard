package com.finance.dashboard.dto.response;

import com.finance.dashboard.domain.enums.AnomalyType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyResponseDTO {

    private UUID recordId;
    private BigDecimal amount;
    private LocalDate date;
    private String description;
    private AnomalyType anomalyType;
    private double severityScore;
    private String anomalyDescription;
}
