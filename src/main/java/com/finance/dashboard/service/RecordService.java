package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.dto.request.CreateRecordRequest;
import com.finance.dashboard.dto.request.UpdateRecordRequest;
import com.finance.dashboard.dto.response.RecordResponse;
import com.finance.dashboard.dto.response.wrapper.PagedResponse;
import com.finance.dashboard.exception.BusinessRuleException;
import com.finance.dashboard.exception.ResourceNotFoundException;
import com.finance.dashboard.mapper.RecordMapper;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.specification.RecordSpecification;
import com.finance.dashboard.util.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecordService {

    private final FinancialRecordRepository recordRepository;
    private final RecordMapper recordMapper;

    private static final BigDecimal MAX_SINGLE_TRANSACTION =
        new BigDecimal("10000000.00"); // ₹1,00,00,000

    @Transactional(readOnly = true)
    public PagedResponse<RecordResponse> getAll(RecordType type, String category,
                                                 LocalDate from, LocalDate to,
                                                 int page, int size, String sort) {
        Specification<FinancialRecord> spec = Specification.where(null);

        if (type != null) {
            spec = spec.and(RecordSpecification.hasType(type));
        }
        if (category != null && !category.isBlank()) {
            spec = spec.and(RecordSpecification.hasCategory(category));
        }
        if (from != null) {
            spec = spec.and(RecordSpecification.dateFrom(from));
        }
        if (to != null) {
            spec = spec.and(RecordSpecification.dateTo(to));
        }

        Sort sortOrder = buildSort(sort);
        Pageable pageable = PageRequest.of(page, size, sortOrder);
        Page<FinancialRecord> recordPage = recordRepository.findAll(spec, pageable);

        List<RecordResponse> records = recordMapper.toResponseList(recordPage.getContent());
        return ResponseBuilder.paged(records, recordPage, "/api/v1/records");
    }

    @Transactional(readOnly = true)
    public RecordResponse getById(UUID id) {
        FinancialRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialRecord", "id", id));
        return recordMapper.toResponse(record);
    }

    @Transactional
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public RecordResponse create(CreateRecordRequest request, User currentUser) {
        // Business rule: ₹1 Crore transaction cap
        if (request.getAmount().compareTo(MAX_SINGLE_TRANSACTION) > 0) {
            throw new BusinessRuleException(
                "Single transaction amount cannot exceed ₹1,00,00,000 (₹1 Crore). " +
                "Transactions above this threshold require manual compliance review."
            );
        }

        // Defense-in-depth: validate amount even if controller-level @Positive is bypassed
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        // Idempotency check — same transactionRef = return existing record
        if (request.getTransactionRef() != null &&
                !request.getTransactionRef().isBlank()) {
            Optional<FinancialRecord> existing =
                recordRepository.findByTransactionRef(request.getTransactionRef());
            if (existing.isPresent()) {
                log.info("Idempotent request detected for transactionRef: {}",
                    request.getTransactionRef());
                return recordMapper.toResponse(existing.get());
            }
        }

        FinancialRecord record = recordMapper.toEntity(request);
        record.setCreatedBy(currentUser);

        // Auto-generate transactionRef if not provided
        if (request.getTransactionRef() == null ||
                request.getTransactionRef().isBlank()) {
            String autoRef = "TXN-" +
                LocalDate.now().getYear() + "-" +
                String.format("%08d",
                    Math.abs(UUID.randomUUID().hashCode()));
            record.setTransactionRef(autoRef);
        } else {
            record.setTransactionRef(request.getTransactionRef());
        }

        FinancialRecord savedRecord = recordRepository.save(record);
        log.info("Financial record created: id={}, type={}, amount={}, by={}",
                savedRecord.getId(), savedRecord.getType(),
                savedRecord.getAmount(), currentUser.getEmail());

        return recordMapper.toResponse(savedRecord);
    }

    @Transactional
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public RecordResponse update(UUID id, UpdateRecordRequest request) {
        FinancialRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialRecord", "id", id));

        if (request.getAmount() != null) {
            record.setAmount(request.getAmount());
        }
        if (request.getType() != null) {
            record.setType(request.getType());
        }
        if (request.getCategory() != null) {
            record.setCategory(request.getCategory());
        }
        if (request.getRecordDate() != null) {
            record.setRecordDate(request.getRecordDate());
        }
        if (request.getNotes() != null) {
            record.setNotes(request.getNotes());
        }
        if (request.getTransactionRef() != null) {
            record.setTransactionRef(request.getTransactionRef());
        }

        FinancialRecord savedRecord = recordRepository.save(record);
        log.info("Financial record updated: id={}", savedRecord.getId());

        return recordMapper.toResponse(savedRecord);
    }

    @Transactional
    @CacheEvict(value = "dashboardSummary", allEntries = true)
    public void delete(UUID id) {
        FinancialRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialRecord", "id", id));

        record.setDeleted(true);
        recordRepository.save(record);
        log.info("Financial record soft-deleted: id={}", id);
    }

    private Sort buildSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "recordDate");
        }

        String[] parts = sort.split(",");
        String field = parts[0].trim();
        Sort.Direction direction = (parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim()))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return Sort.by(direction, field);
    }
}
