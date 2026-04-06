package com.finance.dashboard.controller;

import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.dto.response.CategorySummaryResponse;
import com.finance.dashboard.dto.response.DashboardSummaryResponse;
import com.finance.dashboard.dto.response.MonthlyTrendResponse;
import com.finance.dashboard.dto.response.RecordResponse;
import com.finance.dashboard.dto.response.wrapper.ApiResponse;
import com.finance.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ANALYST','ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Dashboard", description = "Analytical dashboard endpoints for ANALYST and ADMIN roles")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get dashboard summary",
            description = "Returns income/expense totals, net balance, and month-over-month growth")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getSummary() {
        DashboardSummaryResponse summary = dashboardService.getSummary();
        return ResponseEntity.ok(
                ApiResponse.success(summary, "/api/v1/dashboard/summary"));
    }

    @GetMapping("/by-category")
    @Operation(summary = "Get category breakdown",
            description = "Returns income and expense totals grouped by category with percentage share")
    public ResponseEntity<ApiResponse<List<CategorySummaryResponse>>> getCategoryBreakdown() {
        List<CategorySummaryResponse> breakdown = dashboardService.getCategoryBreakdown();
        return ResponseEntity.ok(
                ApiResponse.success(breakdown, "/api/v1/dashboard/by-category"));
    }

    @GetMapping("/trends")
    @Operation(summary = "Get monthly trends",
            description = "Returns monthly income, expense, and net for the last N months")
    public ResponseEntity<ApiResponse<List<MonthlyTrendResponse>>> getMonthlyTrends(
            @RequestParam(defaultValue = "6") int months) {
        List<MonthlyTrendResponse> trends = dashboardService.getMonthlyTrends(months);
        return ResponseEntity.ok(
                ApiResponse.success(trends, "/api/v1/dashboard/trends"));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent activity",
            description = "Returns the 10 most recently created financial records")
    public ResponseEntity<ApiResponse<List<RecordResponse>>> getRecentActivity() {
        List<RecordResponse> recent = dashboardService.getRecentActivity();
        return ResponseEntity.ok(
                ApiResponse.success(recent, "/api/v1/dashboard/recent"));
    }

    @GetMapping("/high-value")
    @Operation(summary = "Get high-value transactions",
        description = "Returns transactions above threshold. " +
            "Useful for anomaly detection and compliance monitoring.")
    public ResponseEntity<?> getHighValueTransactions(
            @RequestParam(defaultValue = "50000") BigDecimal threshold,
            @RequestParam(defaultValue = "EXPENSE") RecordType type,
            HttpServletRequest request) {
        return ResponseEntity.ok(
            dashboardService.getHighValueTransactions(threshold, type, request)
        );
    }
}
