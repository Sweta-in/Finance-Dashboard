package com.finance.dashboard.controller;

import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.dto.request.CreateRecordRequest;
import com.finance.dashboard.dto.request.UpdateRecordRequest;
import com.finance.dashboard.dto.response.RecordResponse;
import com.finance.dashboard.dto.response.wrapper.ApiResponse;
import com.finance.dashboard.dto.response.wrapper.PagedResponse;
import com.finance.dashboard.service.RecordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/records")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Financial Records", description = "CRUD operations for financial records")
public class RecordController {

    private final RecordService recordService;

    @GetMapping
    @Operation(summary = "List financial records", description = "Returns paginated, filterable financial records")
    public ResponseEntity<PagedResponse<RecordResponse>> getAllRecords(
            @RequestParam(required = false) RecordType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sort) {

        PagedResponse<RecordResponse> response = recordService.getAll(
                type, category, from, to, page, size, sort);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get record by ID", description = "Returns a single financial record by UUID")
    public ResponseEntity<ApiResponse<RecordResponse>> getRecordById(@PathVariable UUID id) {
        RecordResponse record = recordService.getById(id);
        return ResponseEntity.ok(
                ApiResponse.success(record, "/api/v1/records/" + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create financial record", description = "Creates a new financial record (admin only)")
    public ResponseEntity<ApiResponse<RecordResponse>> createRecord(
            @Valid @RequestBody CreateRecordRequest request,
            @AuthenticationPrincipal User currentUser) {

        RecordResponse record = recordService.create(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(record, "Record created successfully",
                        "/api/v1/records"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update financial record", description = "Updates an existing financial record (admin only)")
    public ResponseEntity<ApiResponse<RecordResponse>> updateRecord(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRecordRequest request) {

        RecordResponse record = recordService.update(id, request);
        return ResponseEntity.ok(
                ApiResponse.success(record, "Record updated successfully",
                        "/api/v1/records/" + id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete financial record", description = "Soft-deletes a financial record (admin only)")
    public ResponseEntity<Void> deleteRecord(@PathVariable UUID id) {
        recordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
