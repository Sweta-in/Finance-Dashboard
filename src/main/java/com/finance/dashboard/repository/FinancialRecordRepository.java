package com.finance.dashboard.repository;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.enums.RecordType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, UUID>,
        JpaSpecificationExecutor<FinancialRecord> {

    @Query("""
            SELECT COALESCE(SUM(r.amount), 0)
            FROM FinancialRecord r
            WHERE r.type = :type
            """)
    BigDecimal sumByType(@Param("type") RecordType type);

    @Query("""
            SELECT COALESCE(SUM(r.amount), 0)
            FROM FinancialRecord r
            WHERE r.type = :type
            AND r.recordDate >= :from AND r.recordDate <= :to
            """)
    BigDecimal sumByTypeAndDateRange(
            @Param("type") RecordType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query("""
            SELECT r.category, r.type, SUM(r.amount), COUNT(r)
            FROM FinancialRecord r
            GROUP BY r.category, r.type
            ORDER BY SUM(r.amount) DESC
            """)
    List<Object[]> findCategoryTotals();

    @Query(value = """
            SELECT TO_CHAR(r.record_date, 'YYYY-MM') AS month,
                   r.type                            AS type,
                   COALESCE(SUM(r.amount), 0)         AS total
            FROM financial_records r
            WHERE r.record_date >= :from
              AND r.is_deleted = false
            GROUP BY TO_CHAR(r.record_date, 'YYYY-MM'), r.type
            ORDER BY month
            """, nativeQuery = true)
    List<Object[]> findMonthlyTrends(@Param("from") LocalDate from);

    @Query("SELECT MIN(r.recordDate) FROM FinancialRecord r")
    Optional<LocalDate> findEarliestRecordDate();

    Page<FinancialRecord> findAll(Specification<FinancialRecord> spec, Pageable pageable);

    Optional<FinancialRecord> findByTransactionRef(String transactionRef);

    boolean existsByTransactionRef(String transactionRef);

    @Query("""
        SELECT r FROM FinancialRecord r
        WHERE r.amount >= :threshold
        AND r.type = :type
        ORDER BY r.amount DESC
        """)
    List<FinancialRecord> findHighValueTransactions(
        @Param("threshold") BigDecimal threshold,
        @Param("type") RecordType type
    );
}
