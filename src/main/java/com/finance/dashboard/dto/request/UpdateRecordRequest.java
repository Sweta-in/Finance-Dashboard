package com.finance.dashboard.dto.request;

import com.finance.dashboard.domain.enums.RecordType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateRecordRequest {

    @Positive(message = "Amount must be positive")
    @Digits(integer = 13, fraction = 2, message = "Amount must have at most 13 integer digits and 2 decimal places")
    private BigDecimal amount;

    private RecordType type;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    @PastOrPresent(message = "Record date must be in the past or present")
    private LocalDate recordDate;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    @Size(max = 32)
    @Pattern(regexp = "^[A-Z0-9-]*$",
            message = "Transaction reference must be alphanumeric uppercase")
    private String transactionRef;
}
