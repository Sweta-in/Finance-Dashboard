package com.finance.dashboard.util;

import com.finance.dashboard.dto.response.wrapper.ApiResponse;
import com.finance.dashboard.dto.response.wrapper.PagedResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public final class ResponseBuilder {

    private ResponseBuilder() {
        // Utility class — no instantiation
    }

    public static <T> ApiResponse<T> success(T data, String path) {
        return ApiResponse.success(data, path);
    }

    public static <T> ApiResponse<T> success(T data, String message, String path) {
        return ApiResponse.success(data, message, path);
    }

    public static <T> PagedResponse<T> paged(Page<T> page, String path) {
        return PagedResponse.<T>builder()
                .data(page.getContent())
                .message("Data retrieved successfully")
                .path(path)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    public static <T> PagedResponse<T> paged(List<T> content, Page<?> page, String path) {
        return PagedResponse.<T>builder()
                .data(content)
                .message("Data retrieved successfully")
                .path(path)
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
