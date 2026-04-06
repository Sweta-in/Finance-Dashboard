package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.domain.enums.Role;
import com.finance.dashboard.domain.enums.UserStatus;
import com.finance.dashboard.dto.request.CreateRecordRequest;
import com.finance.dashboard.dto.request.UpdateRecordRequest;
import com.finance.dashboard.dto.response.RecordResponse;
import com.finance.dashboard.dto.response.UserResponse;
import com.finance.dashboard.exception.ResourceNotFoundException;
import com.finance.dashboard.mapper.RecordMapper;
import com.finance.dashboard.repository.FinancialRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RecordService Unit Tests")
class RecordServiceTest {

    @Mock
    private FinancialRecordRepository recordRepository;

    @Mock
    private RecordMapper recordMapper;

    @InjectMocks
    private RecordService recordService;

    private User testUser;
    private FinancialRecord testRecord;
    private RecordResponse testRecordResponse;
    private UUID recordId;

    @BeforeEach
    void setUp() {
        recordId = UUID.randomUUID();

        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test User")
                .email("test@finance.dev")
                .passwordHash("encoded-password")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        testRecord = FinancialRecord.builder()
                .id(recordId)
                .amount(new BigDecimal("50000.00"))
                .type(RecordType.INCOME)
                .category("Salary")
                .recordDate(LocalDate.of(2025, 3, 1))
                .notes("March salary")
                .createdBy(testUser)
                .isDeleted(false)
                .build();

        UserResponse userResponse = UserResponse.builder()
                .id(testUser.getId())
                .name(testUser.getName())
                .email(testUser.getEmail())
                .role(testUser.getRole())
                .status(testUser.getStatus())
                .build();

        testRecordResponse = RecordResponse.builder()
                .id(recordId)
                .amount(new BigDecimal("50000.00"))
                .type(RecordType.INCOME)
                .category("Salary")
                .recordDate(LocalDate.of(2025, 3, 1))
                .notes("March salary")
                .createdBy(userResponse)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("createRecord — valid input returns RecordResponse")
    void createRecord_validInput_returnsRecordResponse() {
        CreateRecordRequest request = CreateRecordRequest.builder()
                .amount(new BigDecimal("50000.00"))
                .type(RecordType.INCOME)
                .category("Salary")
                .recordDate(LocalDate.of(2025, 3, 1))
                .notes("March salary")
                .build();

        when(recordMapper.toEntity(request)).thenReturn(testRecord);
        when(recordRepository.save(any(FinancialRecord.class))).thenReturn(testRecord);
        when(recordMapper.toResponse(testRecord)).thenReturn(testRecordResponse);

        RecordResponse result = recordService.create(request, testUser);

        assertThat(result).isNotNull();
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
        assertThat(result.getType()).isEqualTo(RecordType.INCOME);
        assertThat(result.getCategory()).isEqualTo("Salary");

        verify(recordMapper).toEntity(request);
        verify(recordRepository).save(any(FinancialRecord.class));
        verify(recordMapper).toResponse(testRecord);
    }

    @Test
    @DisplayName("createRecord — negative amount throws exception")
    void createRecord_negativeAmount_throwsException() {
        CreateRecordRequest request = CreateRecordRequest.builder()
                .amount(new BigDecimal("-5000.00"))
                .type(RecordType.EXPENSE)
                .category("Test")
                .recordDate(LocalDate.of(2025, 3, 1))
                .notes("Negative amount test")
                .build();

        assertThatThrownBy(() -> recordService.create(request, testUser))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("positive");

        verify(recordRepository, never()).save(any());
    }

    @Test
    @DisplayName("getById — existing ID returns RecordResponse")
    void getById_existingId_returnsRecordResponse() {
        when(recordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(recordMapper.toResponse(testRecord)).thenReturn(testRecordResponse);

        RecordResponse result = recordService.getById(recordId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(recordId);
        verify(recordRepository).findById(recordId);
    }

    @Test
    @DisplayName("getById — non-existent ID throws ResourceNotFoundException")
    void getById_nonExistentId_throwsResourceNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(recordRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recordService.getById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("FinancialRecord")
                .hasMessageContaining("id");

        verify(recordRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("getById — deleted record is filtered by @SQLRestriction, throws ResourceNotFoundException")
    void getById_deletedRecord_throwsResourceNotFound() {
        // @SQLRestriction filters at the JPA level, so findById returns empty
        UUID deletedRecordId = UUID.randomUUID();
        when(recordRepository.findById(deletedRecordId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recordService.getById(deletedRecordId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("softDelete — existing record sets isDeleted to true")
    void softDelete_existingRecord_setsIsDeletedTrue() {
        when(recordRepository.findById(recordId)).thenReturn(Optional.of(testRecord));
        when(recordRepository.save(any(FinancialRecord.class))).thenReturn(testRecord);

        recordService.delete(recordId);

        assertThat(testRecord.isDeleted()).isTrue();
        verify(recordRepository).findById(recordId);
        verify(recordRepository).save(testRecord);
    }

    @Test
    @DisplayName("softDelete — non-existent ID throws ResourceNotFoundException")
    void softDelete_nonExistentId_throwsResourceNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(recordRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> recordService.delete(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(recordRepository, never()).save(any());
    }

    @Test
    @DisplayName("update — partial fields only updates provided fields")
    void update_partialFields_onlyUpdatesProvidedFields() {
        UpdateRecordRequest request = UpdateRecordRequest.builder()
                .amount(new BigDecimal("75000.00"))
                .build();

        FinancialRecord existingRecord = FinancialRecord.builder()
                .id(recordId)
                .amount(new BigDecimal("50000.00"))
                .type(RecordType.INCOME)
                .category("Salary")
                .recordDate(LocalDate.of(2025, 3, 1))
                .notes("March salary")
                .createdBy(testUser)
                .isDeleted(false)
                .build();

        when(recordRepository.findById(recordId)).thenReturn(Optional.of(existingRecord));
        when(recordRepository.save(any(FinancialRecord.class))).thenReturn(existingRecord);
        when(recordMapper.toResponse(existingRecord)).thenReturn(testRecordResponse);

        recordService.update(recordId, request);

        // Only amount should have changed
        assertThat(existingRecord.getAmount()).isEqualByComparingTo(new BigDecimal("75000.00"));
        // Other fields remain untouched
        assertThat(existingRecord.getType()).isEqualTo(RecordType.INCOME);
        assertThat(existingRecord.getCategory()).isEqualTo("Salary");
        assertThat(existingRecord.getRecordDate()).isEqualTo(LocalDate.of(2025, 3, 1));
        assertThat(existingRecord.getNotes()).isEqualTo("March salary");

        verify(recordRepository).save(existingRecord);
    }

    @Test
    @DisplayName("getAll — with type filter calls repository with specification")
    @SuppressWarnings("unchecked")
    void getAll_withTypeFilter_callsRepositoryWithSpec() {
        Page<FinancialRecord> page = new PageImpl<>(List.of(testRecord));
        when(recordRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(recordMapper.toResponseList(List.of(testRecord))).thenReturn(List.of(testRecordResponse));

        var result = recordService.getAll(RecordType.INCOME, null, null, null, 0, 20, null);

        assertThat(result).isNotNull();
        assertThat(result.getData()).hasSize(1);
        assertThat(result.getTotalElements()).isEqualTo(1);

        verify(recordRepository).findAll(any(Specification.class), any(Pageable.class));
    }
}
