package com.finance.dashboard.service;

import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.dto.response.CategorySummaryResponse;
import com.finance.dashboard.dto.response.DashboardSummaryResponse;
import com.finance.dashboard.dto.response.MonthlyTrendResponse;
import com.finance.dashboard.mapper.RecordMapper;
import com.finance.dashboard.repository.FinancialRecordRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("DashboardService Unit Tests")
class DashboardServiceTest {

    @Mock
    private FinancialRecordRepository recordRepository;

    @Mock
    private RecordMapper recordMapper;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("getSummary — calculates net balance correctly")
    void getSummary_calculatesNetBalanceCorrectly() {
        when(recordRepository.sumByType(RecordType.INCOME)).thenReturn(new BigDecimal("500000.00"));
        when(recordRepository.sumByType(RecordType.EXPENSE)).thenReturn(new BigDecimal("200000.00"));
        when(recordRepository.count()).thenReturn(30L);
        when(recordRepository.sumByTypeAndDateRange(eq(RecordType.INCOME), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("150000.00"));
        when(recordRepository.sumByTypeAndDateRange(eq(RecordType.EXPENSE), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(new BigDecimal("50000.00"));

        DashboardSummaryResponse result = dashboardService.getSummary();

        assertThat(result.getTotalIncome()).isEqualByComparingTo(new BigDecimal("500000.00"));
        assertThat(result.getTotalExpenses()).isEqualByComparingTo(new BigDecimal("200000.00"));
        assertThat(result.getNetBalance()).isEqualByComparingTo(new BigDecimal("300000.00"));
        assertThat(result.getTotalRecords()).isEqualTo(30L);
    }

    @Test
    @DisplayName("getSummary — zero previous month income yields 100% growth")
    void getSummary_zeroPrevMonthIncome_growthIs100Percent() {
        when(recordRepository.sumByType(RecordType.INCOME)).thenReturn(new BigDecimal("100000.00"));
        when(recordRepository.sumByType(RecordType.EXPENSE)).thenReturn(BigDecimal.ZERO);
        when(recordRepository.count()).thenReturn(5L);

        // Current month has income, previous month has zero
        LocalDate today = LocalDate.now();
        LocalDate firstOfCurrentMonth = today.withDayOfMonth(1);
        YearMonth prevMonth = YearMonth.from(today).minusMonths(1);

        when(recordRepository.sumByTypeAndDateRange(eq(RecordType.INCOME),
                eq(firstOfCurrentMonth), eq(today)))
                .thenReturn(new BigDecimal("50000.00"));
        when(recordRepository.sumByTypeAndDateRange(eq(RecordType.INCOME),
                eq(prevMonth.atDay(1)), eq(prevMonth.atEndOfMonth())))
                .thenReturn(BigDecimal.ZERO);
        when(recordRepository.sumByTypeAndDateRange(eq(RecordType.EXPENSE),
                any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);

        DashboardSummaryResponse result = dashboardService.getSummary();

        assertThat(result.getIncomeGrowthPercent()).isEqualTo(100.0);
    }

    @Test
    @DisplayName("getSummary — both zero months produces no arithmetic exception")
    void getSummary_bothZero_noArithmeticException() {
        when(recordRepository.sumByType(RecordType.INCOME)).thenReturn(BigDecimal.ZERO);
        when(recordRepository.sumByType(RecordType.EXPENSE)).thenReturn(BigDecimal.ZERO);
        when(recordRepository.count()).thenReturn(0L);
        when(recordRepository.sumByTypeAndDateRange(any(RecordType.class),
                any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(BigDecimal.ZERO);

        DashboardSummaryResponse result = dashboardService.getSummary();

        assertThat(result.getIncomeGrowthPercent()).isEqualTo(0.0);
        assertThat(result.getExpenseGrowthPercent()).isEqualTo(0.0);
        assertThat(result.getNetBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("getMonthlyTrends — fills zero for empty months")
    void getMonthlyTrends_fillsZeroForEmptyMonths() {
        int months = 3;
        LocalDate from = LocalDate.now().minusMonths(months).withDayOfMonth(1);

        // Only return data for one month — native query returns String for type column
        String oneMonth = YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        List<Object[]> rawData = Collections.singletonList(
                new Object[]{oneMonth, "INCOME", new BigDecimal("100000.00")}
        );

        when(recordRepository.findMonthlyTrends(from)).thenReturn(rawData);

        List<MonthlyTrendResponse> result = dashboardService.getMonthlyTrends(months);

        // Should have entries for all months in range (months + 1 including current)
        assertThat(result).hasSizeGreaterThanOrEqualTo(months);

        // Months without data should have zero values
        for (MonthlyTrendResponse trend : result) {
            if (!trend.getMonth().equals(oneMonth)) {
                assertThat(trend.getIncome()).isEqualByComparingTo(BigDecimal.ZERO);
                assertThat(trend.getExpenses()).isEqualByComparingTo(BigDecimal.ZERO);
                assertThat(trend.getNet()).isEqualByComparingTo(BigDecimal.ZERO);
            }
        }

        // The month with data should have correct values
        MonthlyTrendResponse dataMonth = result.stream()
                .filter(t -> t.getMonth().equals(oneMonth))
                .findFirst()
                .orElseThrow();
        assertThat(dataMonth.getIncome()).isEqualByComparingTo(new BigDecimal("100000.00"));
    }

    @Test
    @DisplayName("getCategoryBreakdown — calculates percentages correctly")
    void getCategoryBreakdown_calculatesPercentagesCorrectly() {
        List<Object[]> rawData = Arrays.asList(
                new Object[]{"Salary", RecordType.INCOME, new BigDecimal("300000.00"), 3L},
                new Object[]{"Freelance", RecordType.INCOME, new BigDecimal("100000.00"), 2L},
                new Object[]{"Rent", RecordType.EXPENSE, new BigDecimal("100000.00"), 5L},
                new Object[]{"Groceries", RecordType.EXPENSE, new BigDecimal("50000.00"), 3L}
        );

        when(recordRepository.findCategoryTotals()).thenReturn(rawData);

        List<CategorySummaryResponse> result = dashboardService.getCategoryBreakdown();

        assertThat(result).hasSize(4);

        // Salary = 300k / 400k total income = 75%
        CategorySummaryResponse salary = result.stream()
                .filter(c -> c.getCategory().equals("Salary"))
                .findFirst()
                .orElseThrow();
        assertThat(salary.getPercentage()).isEqualTo(75.0);
        assertThat(salary.getRecordCount()).isEqualTo(3L);

        // Freelance = 100k / 400k total income = 25%
        CategorySummaryResponse freelance = result.stream()
                .filter(c -> c.getCategory().equals("Freelance"))
                .findFirst()
                .orElseThrow();
        assertThat(freelance.getPercentage()).isEqualTo(25.0);

        // Rent = 100k / 150k total expenses ≈ 66.67%
        CategorySummaryResponse rent = result.stream()
                .filter(c -> c.getCategory().equals("Rent"))
                .findFirst()
                .orElseThrow();
        assertThat(rent.getPercentage()).isCloseTo(66.67, within(0.01));

        // Groceries = 50k / 150k total expenses ≈ 33.33%
        CategorySummaryResponse groceries = result.stream()
                .filter(c -> c.getCategory().equals("Groceries"))
                .findFirst()
                .orElseThrow();
        assertThat(groceries.getPercentage()).isCloseTo(33.33, within(0.01));
    }
}
