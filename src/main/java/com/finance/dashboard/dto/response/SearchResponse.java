package com.finance.dashboard.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResponse {

    private List<SearchResultItem> results;
    private long totalCount;
    private int page;
    private int size;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchResultItem {
        private UUID id;
        private String name;
        private String category;
        private BigDecimal amount;
        private String type;
        private LocalDate date;
    }
}
