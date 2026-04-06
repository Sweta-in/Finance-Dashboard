package com.finance.dashboard.service;

import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.dto.response.CategorySummaryResponse;
import com.finance.dashboard.dto.response.DashboardSummaryResponse;
import com.finance.dashboard.dto.response.MonthlyTrendResponse;
import com.finance.dashboard.dto.response.RecordResponse;
import com.finance.dashboard.dto.response.wrapper.ApiResponse;
import com.finance.dashboard.mapper.RecordMapper;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.util.ResponseBuilder;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final FinancialRecordRepository recordRepository;
    private final RecordMapper recordMapper;

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    @Transactional(readOnly = true)
    @Cacheable("dashboardSummary")
    public DashboardSummaryResponse getSummary() {
        BigDecimal totalIncome = recordRepository.sumByType(RecordType.INCOME);
        BigDecimal totalExpenses = recordRepository.sumByType(RecordType.EXPENSE);
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);
        long totalRecords = recordRepository.count();

        // Current month range
        LocalDate today = LocalDate.now();
        LocalDate firstOfCurrentMonth = today.withDayOfMonth(1);

        // Previous month range
        YearMonth prevMonth = YearMonth.from(today).minusMonths(1);
        LocalDate firstOfPrevMonth = prevMonth.atDay(1);
        LocalDate lastOfPrevMonth = prevMonth.atEndOfMonth();

        BigDecimal currentMonthIncome = recordRepository.sumByTypeAndDateRange(
                RecordType.INCOME, firstOfCurrentMonth, today);
        BigDecimal prevMonthIncome = recordRepository.sumByTypeAndDateRange(
                RecordType.INCOME, firstOfPrevMonth, lastOfPrevMonth);

        BigDecimal currentMonthExpense = recordRepository.sumByTypeAndDateRange(
                RecordType.EXPENSE, firstOfCurrentMonth, today);
        BigDecimal prevMonthExpense = recordRepository.sumByTypeAndDateRange(
                RecordType.EXPENSE, firstOfPrevMonth, lastOfPrevMonth);

        double incomeGrowth = calculateGrowthPercent(prevMonthIncome, currentMonthIncome);
        double expenseGrowth = calculateGrowthPercent(prevMonthExpense, currentMonthExpense);

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .totalRecords(totalRecords)
                .incomeGrowthPercent(incomeGrowth)
                .expenseGrowthPercent(expenseGrowth)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CategorySummaryResponse> getCategoryBreakdown() {
        List<Object[]> rawData = recordRepository.findCategoryTotals();

        // Calculate total per type for percentage computation
        Map<RecordType, BigDecimal> typeTotals = new HashMap<>();
        for (Object[] row : rawData) {
            RecordType type = (RecordType) row[1];
            BigDecimal amount = (BigDecimal) row[2];
            typeTotals.merge(type, amount, BigDecimal::add);
        }

        List<CategorySummaryResponse> results = new ArrayList<>();
        for (Object[] row : rawData) {
            String category = (String) row[0];
            RecordType type = (RecordType) row[1];
            BigDecimal total = (BigDecimal) row[2];
            long count = (Long) row[3];

            BigDecimal typeTotal = typeTotals.getOrDefault(type, BigDecimal.ONE);
            double percentage = typeTotal.compareTo(BigDecimal.ZERO) == 0
                    ? 0.0
                    : total.multiply(BigDecimal.valueOf(100))
                            .divide(typeTotal, 2, RoundingMode.HALF_UP)
                            .doubleValue();

            results.add(CategorySummaryResponse.builder()
                    .category(category)
                    .type(type)
                    .total(total)
                    .recordCount(count)
                    .percentage(percentage)
                    .build());
        }

        return results;
    }

    @Transactional(readOnly = true)
    public List<MonthlyTrendResponse> getMonthlyTrends(int months) {
        LocalDate from = LocalDate.now().minusMonths(months).withDayOfMonth(1);
        List<Object[]> rawData = recordRepository.findMonthlyTrends(from);
        log.debug("Monthly trends query returned {} rows for range starting {}", rawData.size(), from);

        // Fallback: if no data in the recent N months, extend to the earliest available record
        if (rawData.isEmpty()) {
            Optional<LocalDate> earliest = recordRepository.findEarliestRecordDate();
            if (earliest.isPresent() && earliest.get().isBefore(from)) {
                from = earliest.get().withDayOfMonth(1);
                rawData = recordRepository.findMonthlyTrends(from);
                log.debug("Fallback: extended range to {} — now {} rows", from, rawData.size());
            }
        }

        // Pivot raw data into a map: month -> {type -> sum}
        // Native query returns: [String month, String type, BigDecimal/Number total]
        Map<String, Map<RecordType, BigDecimal>> pivotMap = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            String month = (String) row[0];
            RecordType type = RecordType.valueOf((String) row[1]);
            BigDecimal sum = row[2] instanceof BigDecimal
                    ? (BigDecimal) row[2]
                    : new BigDecimal(row[2].toString());
            pivotMap.computeIfAbsent(month, k -> new HashMap<>()).put(type, sum);
        }

        // Generate all months in range to fill zeros for empty months
        List<MonthlyTrendResponse> trends = new ArrayList<>();
        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.now();

        for (YearMonth ym = start; !ym.isAfter(end); ym = ym.plusMonths(1)) {
            String monthKey = ym.format(MONTH_FORMATTER);
            Map<RecordType, BigDecimal> monthData = pivotMap.getOrDefault(monthKey, Collections.emptyMap());

            BigDecimal income = monthData.getOrDefault(RecordType.INCOME, BigDecimal.ZERO);
            BigDecimal expenses = monthData.getOrDefault(RecordType.EXPENSE, BigDecimal.ZERO);

            trends.add(MonthlyTrendResponse.builder()
                    .month(monthKey)
                    .income(income)
                    .expenses(expenses)
                    .net(income.subtract(expenses))
                    .build());
        }

        return trends;
    }

    @Transactional(readOnly = true)
    public List<RecordResponse> getRecentActivity() {
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by("createdAt").descending());
        return recordMapper.toResponseList(
                recordRepository.findAll(pageRequest).getContent()
        );
    }

    @Transactional(readOnly = true)
    public ApiResponse<List<RecordResponse>> getHighValueTransactions(
            BigDecimal threshold, RecordType type,
            HttpServletRequest req) {
        List<RecordResponse> records = recordRepository
            .findHighValueTransactions(threshold, type)
            .stream()
            .map(recordMapper::toResponse)
            .toList();
        return ResponseBuilder.success(
            records,
            "High-value transactions retrieved",
            req.getRequestURI()
        );
    }

    private double calculateGrowthPercent(BigDecimal previous, BigDecimal current) {
        if (previous.compareTo(BigDecimal.ZERO) == 0 && current.compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return 100.0;
        }
        return current.subtract(previous)
                .multiply(BigDecimal.valueOf(100))
                .divide(previous, 2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
