package com.finance.dashboard.repository.specification;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.enums.RecordType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class RecordSpecification {

    private RecordSpecification() {
        // Utility class — no instantiation
    }

    public static Specification<FinancialRecord> hasType(RecordType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<FinancialRecord> hasCategory(String category) {
        return (root, query, cb) -> cb.equal(root.get("category"), category);
    }

    public static Specification<FinancialRecord> dateFrom(LocalDate from) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("recordDate"), from);
    }

    public static Specification<FinancialRecord> dateTo(LocalDate to) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("recordDate"), to);
    }
}
