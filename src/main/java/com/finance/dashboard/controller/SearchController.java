package com.finance.dashboard.controller;

import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.dto.response.SearchResponse;
import com.finance.dashboard.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Global search endpoint for searching across financial records.
 * Secured by the existing JWT authentication filter.
 * Rate-limited by RateLimitInterceptor (30 requests/minute per user).
 */
@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Search", description = "Global search across all financial records")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @Operation(
            summary = "Search financial records",
            description = "Full-text search across transactions by name, category, amount, or date. " +
                    "Supports pagination and optional type/category filters."
    )
    public ResponseEntity<SearchResponse> search(
            @Parameter(description = "Search query (searches notes, category, amount)")
            @RequestParam(value = "q", defaultValue = "") String query,

            @Parameter(description = "Optional exact category filter")
            @RequestParam(required = false) String category,

            @Parameter(description = "Filter by type: income, expense, or all")
            @RequestParam(defaultValue = "all") String type,

            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Page size (max 50)")
            @RequestParam(defaultValue = "10") int size
    ) {
        // ── Input sanitization ─────────────────────────────────────
        String sanitizedQuery = sanitizeInput(query);
        String sanitizedCategory = category != null ? sanitizeInput(category) : null;

        // ── Parse type filter ──────────────────────────────────────
        RecordType recordType = parseRecordType(type);

        SearchResponse response = searchService.search(
                sanitizedQuery, sanitizedCategory, recordType, page, size);

        return ResponseEntity.ok(response);
    }

    /**
     * Sanitize user input to prevent SQL injection and limit length.
     * Although JPA parameterized queries prevent SQL injection by design,
     * this provides defense-in-depth.
     */
    private String sanitizeInput(String input) {
        if (input == null) return null;
        // Limit length to 100 characters
        String trimmed = input.trim();
        if (trimmed.length() > 100) {
            trimmed = trimmed.substring(0, 100);
        }
        // Strip dangerous SQL metacharacters (defense-in-depth)
        return trimmed.replaceAll("[;'\"\\\\]", "");
    }

    private RecordType parseRecordType(String type) {
        if (type == null || type.isBlank() || "all".equalsIgnoreCase(type)) {
            return null;
        }
        try {
            return RecordType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null; // Invalid type → search all
        }
    }
}
