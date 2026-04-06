package com.finance.dashboard.repository.specification;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.enums.RecordType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic JPA Specification builder for global search across financial records.
 * Uses ILIKE for text matching (PostgreSQL) with fall-through to case-insensitive LIKE.
 */
public final class SearchSpecification {

    private SearchSpecification() {
        // Utility class — no instantiation
    }

    /**
     * Build a composite specification for searching financial records.
     *
     * @param query    The search query (searches notes, category, and amount if numeric)
     * @param category Optional exact category filter
     * @param type     Optional type filter (INCOME/EXPENSE)
     * @return Specification for FinancialRecord
     */
    public static Specification<FinancialRecord> buildSearchSpec(
            String query, String category, RecordType type) {

        return (root, criteriaQuery, cb) -> {
            List<Predicate> andPredicates = new ArrayList<>();

            // ── Text search across notes and category ──────────────────
            if (query != null && !query.isBlank()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                List<Predicate> orPredicates = new ArrayList<>();

                // Search in notes (acts as "name/description")
                orPredicates.add(cb.like(cb.lower(root.get("notes")), pattern));

                // Search in category
                orPredicates.add(cb.like(cb.lower(root.get("category")), pattern));

                // If the query looks like a number, also match amount
                try {
                    BigDecimal numericQuery = new BigDecimal(query.trim());
                    // Match exact amount or amounts within 10% range
                    BigDecimal lowerBound = numericQuery.multiply(BigDecimal.valueOf(0.9));
                    BigDecimal upperBound = numericQuery.multiply(BigDecimal.valueOf(1.1));
                    orPredicates.add(cb.between(root.get("amount"), lowerBound, upperBound));
                } catch (NumberFormatException ignored) {
                    // Not numeric — skip amount matching
                }

                andPredicates.add(cb.or(orPredicates.toArray(new Predicate[0])));
            }

            // ── Exact category filter ──────────────────────────────────
            if (category != null && !category.isBlank()) {
                andPredicates.add(cb.equal(cb.lower(root.get("category")),
                        category.trim().toLowerCase()));
            }

            // ── Type filter ────────────────────────────────────────────
            if (type != null) {
                andPredicates.add(cb.equal(root.get("type"), type));
            }

            // ── Soft delete filter (redundant with @SQLRestriction but explicit) ──
            andPredicates.add(cb.equal(root.get("isDeleted"), false));

            return cb.and(andPredicates.toArray(new Predicate[0]));
        };
    }
}
