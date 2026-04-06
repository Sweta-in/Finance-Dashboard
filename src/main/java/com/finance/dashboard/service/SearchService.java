package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.dto.response.SearchResponse;
import com.finance.dashboard.dto.response.SearchResponse.SearchResultItem;
import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.specification.SearchSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for global search across financial records.
 * Uses JPA Specifications for dynamic, type-safe query building.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final FinancialRecordRepository recordRepository;

    /**
     * Search financial records with dynamic filtering.
     *
     * @param query    Free-text search query (searches notes, category, amount)
     * @param category Optional exact category filter
     * @param type     Optional type filter (INCOME/EXPENSE), null for all
     * @param page     Page number (0-indexed)
     * @param size     Page size (max 50)
     * @return SearchResponse with paginated results
     */
    @Transactional(readOnly = true)
    public SearchResponse search(String query, String category, RecordType type,
                                  int page, int size) {
        // Clamp size to prevent abuse
        int clampedSize = Math.min(Math.max(size, 1), 50);

        log.debug("Search request: query='{}', category='{}', type={}, page={}, size={}",
                query, category, type, page, clampedSize);

        Specification<FinancialRecord> spec = SearchSpecification.buildSearchSpec(
                query, category, type);

        PageRequest pageRequest = PageRequest.of(page, clampedSize,
                Sort.by("recordDate").descending());

        Page<FinancialRecord> results = recordRepository.findAll(spec, pageRequest);

        List<SearchResultItem> items = results.getContent().stream()
                .map(this::toSearchResultItem)
                .toList();

        return SearchResponse.builder()
                .results(items)
                .totalCount(results.getTotalElements())
                .page(results.getNumber())
                .size(results.getSize())
                .build();
    }

    private SearchResultItem toSearchResultItem(FinancialRecord record) {
        return SearchResultItem.builder()
                .id(record.getId())
                .name(record.getNotes() != null ? record.getNotes() : record.getCategory())
                .category(record.getCategory())
                .amount(record.getAmount())
                .type(record.getType().name().toLowerCase())
                .date(record.getRecordDate())
                .build();
    }
}
