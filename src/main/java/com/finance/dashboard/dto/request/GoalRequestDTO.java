package com.finance.dashboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoalRequestDTO {

    @NotBlank(message = "Goal name is required")
    @Size(max = 150, message = "Goal name must not exceed 150 characters")
    private String name;

    @Size(max = 50, message = "Icon key must not exceed 50 characters")
    private String icon;

    @NotNull(message = "Target amount is required")
    @Positive(message = "Target amount must be positive")
    private Double targetAmount;

    @NotNull(message = "Deadline is required")
    private LocalDate deadline;
}
