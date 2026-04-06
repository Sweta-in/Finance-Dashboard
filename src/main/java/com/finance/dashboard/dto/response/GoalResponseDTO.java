package com.finance.dashboard.dto.response;

import com.finance.dashboard.domain.enums.GoalStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponseDTO {

    private Long id;
    private String name;
    private String icon;
    private Double targetAmount;
    private Double savedAmount;
    private LocalDate deadline;
    private GoalStatus status;
    private long daysLeft;
    private double percentComplete;
    private Double remainingAmount;
}
