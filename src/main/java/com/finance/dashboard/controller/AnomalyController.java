package com.finance.dashboard.controller;

import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.AnomalyType;
import com.finance.dashboard.dto.response.AnomalyResponseDTO;
import com.finance.dashboard.dto.response.wrapper.ApiResponse;
import com.finance.dashboard.service.AnomalyDetectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ANALYST','ADMIN')")
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Dashboard", description = "Analytical dashboard endpoints for ANALYST and ADMIN roles")
public class AnomalyController {

    private final AnomalyDetectionService anomalyDetectionService;

    @GetMapping("/anomalies")
    @Operation(summary = "Detect anomalies",
            description = "Runs statistical anomaly detection (z-score + 7-day rolling spike) on financial records. "
                    + "Supports optional filtering by anomaly type and date range.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
            description = "Anomaly detection results returned successfully")
    public ResponseEntity<ApiResponse<List<AnomalyResponseDTO>>> getAnomalies(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) AnomalyType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        List<AnomalyResponseDTO> anomalies = anomalyDetectionService.detectAnomalies(
                currentUser, type, from, to);

        String message = anomalies.isEmpty()
                ? "No anomalies detected in the selected period"
                : anomalies.size() + " anomalies detected";

        return ResponseEntity.ok(
                ApiResponse.success(anomalies, message, "/api/v1/dashboard/anomalies"));
    }
}
