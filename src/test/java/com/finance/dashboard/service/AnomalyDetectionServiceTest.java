package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.AnomalyType;
import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.domain.enums.Role;
import com.finance.dashboard.domain.enums.UserStatus;
import com.finance.dashboard.dto.response.AnomalyResponseDTO;
import com.finance.dashboard.repository.FinancialRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AnomalyDetectionService Unit Tests")
class AnomalyDetectionServiceTest {

    @Mock
    private FinancialRecordRepository recordRepository;

    @InjectMocks
    private AnomalyDetectionService anomalyDetectionService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("Test Analyst")
                .email("analyst@finance.dev")
                .passwordHash("encoded-password")
                .role(Role.ANALYST)
                .status(UserStatus.ACTIVE)
                .build();
    }

    // ── Helper to build a record with a specific amount and date ──────

    private FinancialRecord buildRecord(double amount, LocalDate date) {
        return FinancialRecord.builder()
                .id(UUID.randomUUID())
                .amount(BigDecimal.valueOf(amount))
                .type(RecordType.EXPENSE)
                .category("Test")
                .recordDate(date)
                .notes("Test transaction")
                .createdBy(testUser)
                .isDeleted(false)
                .build();
    }

    // ── 1. Normal data → returns empty list ──────────────────────────

    @Test
    @DisplayName("detectAnomalies — normal data with similar amounts returns no anomalies")
    void detectAnomalies_normalData_returnsNoAnomalies() {
        LocalDate base = LocalDate.of(2025, 3, 1);
        List<FinancialRecord> records = List.of(
                buildRecord(900, base),
                buildRecord(1100, base.plusDays(1)),
                buildRecord(950, base.plusDays(2)),
                buildRecord(1050, base.plusDays(3)),
                buildRecord(800, base.plusDays(4)),
                buildRecord(1200, base.plusDays(5)),
                buildRecord(1020, base.plusDays(6)),
                buildRecord(980, base.plusDays(7)),
                buildRecord(850, base.plusDays(8)),
                buildRecord(1150, base.plusDays(9))
        );
        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, null, null, null);

        assertThat(result).isEmpty();
    }

    // ── 2. Record 3σ above mean → flagged as HIGH_AMOUNT ────────────

    @Test
    @DisplayName("detectAnomalies — record 3σ above mean is flagged as HIGH_AMOUNT")
    void detectAnomalies_highAmount_flaggedAsHighAmount() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = new ArrayList<>(List.of(
                buildRecord(1000, base),
                buildRecord(1000, base.plusDays(1)),
                buildRecord(1000, base.plusDays(2)),
                buildRecord(1000, base.plusDays(3)),
                buildRecord(1000, base.plusDays(4)),
                buildRecord(1000, base.plusDays(5)),
                buildRecord(1000, base.plusDays(6)),
                buildRecord(1000, base.plusDays(7)),
                buildRecord(1000, base.plusDays(8))
        ));

        FinancialRecord outlier = buildRecord(50000, base.plusDays(9));
        records.add(outlier);

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, AnomalyType.HIGH_AMOUNT, null, null);

        assertThat(result).isNotEmpty();
        assertThat(result).anyMatch(a ->
                a.getRecordId().equals(outlier.getId())
                        && a.getAnomalyType() == AnomalyType.HIGH_AMOUNT
                        && a.getSeverityScore() > 0.0
                        && a.getSeverityScore() <= 1.0
                        && a.getAnomalyDescription().contains("above your average")
        );

        assertThat(result).allMatch(a ->
                a.getAmount().doubleValue() > 2000);
    }

    // ── 3. Record 4x rolling average → flagged as SUDDEN_SPIKE ──────

    @Test
    @DisplayName("detectAnomalies — record 4x the 7-day average is flagged as SUDDEN_SPIKE")
    void detectAnomalies_suddenSpike_flaggedAsSuddenSpike() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = new ArrayList<>(List.of(
                buildRecord(1000, base),
                buildRecord(1000, base.plusDays(1)),
                buildRecord(1000, base.plusDays(2)),
                buildRecord(1000, base.plusDays(3)),
                buildRecord(1000, base.plusDays(4)),
                buildRecord(1000, base.plusDays(5)),
                buildRecord(1000, base.plusDays(6))
        ));

        FinancialRecord spike = buildRecord(5000, base.plusDays(7));
        records.add(spike);

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, AnomalyType.SUDDEN_SPIKE, null, null);

        assertThat(result).isNotEmpty();
        assertThat(result).anyMatch(a ->
                a.getRecordId().equals(spike.getId())
                        && a.getAnomalyType() == AnomalyType.SUDDEN_SPIKE
                        && a.getSeverityScore() > 0.0
                        && a.getAnomalyDescription().contains("7-day average")
        );
    }

    // ── 4. Empty record list → returns empty without exception ──────

    @Test
    @DisplayName("detectAnomalies — empty record list returns empty result without exception")
    void detectAnomalies_emptyRecords_returnsEmptyWithoutException() {
        when(recordRepository.findByCreatedBy(testUser)).thenReturn(Collections.emptyList());

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, null, null, null);

        assertThat(result).isEmpty();
        verify(recordRepository).findByCreatedBy(testUser);
    }

    // ── 5. Date filter → only anomalies within range returned ───────

    @Test
    @DisplayName("detectAnomalies — date filter excludes out-of-range anomalies")
    void detectAnomalies_dateFilter_excludesOutOfRange() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = new ArrayList<>(List.of(
                buildRecord(1000, base),
                buildRecord(1000, base.plusDays(1)),
                buildRecord(1000, base.plusDays(2)),
                buildRecord(1000, base.plusDays(3)),
                buildRecord(1000, base.plusDays(4)),
                buildRecord(1000, base.plusDays(5)),
                buildRecord(1000, base.plusDays(6))
        ));

        // Outlier on March 20 — outside the filter range
        FinancialRecord outlier = buildRecord(50000, LocalDate.of(2025, 3, 20));
        records.add(outlier);

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        // Filter from March 1 to March 10 — the outlier on March 20 should be excluded
        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, null,
                LocalDate.of(2025, 3, 1),
                LocalDate.of(2025, 3, 10));

        assertThat(result).noneMatch(a -> a.getRecordId().equals(outlier.getId()));
    }

    // ── 6. Type filter HIGH_AMOUNT → SUDDEN_SPIKE excluded ──────────

    @Test
    @DisplayName("detectAnomalies — type filter HIGH_AMOUNT excludes SUDDEN_SPIKE results")
    void detectAnomalies_typeFilterHighAmount_excludesSuddenSpike() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = new ArrayList<>(List.of(
                buildRecord(1000, base),
                buildRecord(1000, base.plusDays(1)),
                buildRecord(1000, base.plusDays(2)),
                buildRecord(1000, base.plusDays(3)),
                buildRecord(1000, base.plusDays(4)),
                buildRecord(1000, base.plusDays(5)),
                buildRecord(1000, base.plusDays(6))
        ));

        // This spike is 5x the rolling average — would be SUDDEN_SPIKE
        FinancialRecord spike = buildRecord(5000, base.plusDays(7));
        records.add(spike);

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        // Request only HIGH_AMOUNT — SUDDEN_SPIKE should NOT appear
        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, AnomalyType.HIGH_AMOUNT, null, null);

        assertThat(result).noneMatch(a ->
                a.getAnomalyType() == AnomalyType.SUDDEN_SPIKE);
    }

    // ── Bonus: Severity score clamped 0.0–1.0 ───────────────────────

    @Test
    @DisplayName("detectAnomalies — severity score is always between 0.0 and 1.0")
    void detectAnomalies_severityScore_clampedTo0And1() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = new ArrayList<>(List.of(
                buildRecord(100, base),
                buildRecord(100, base.plusDays(1)),
                buildRecord(100, base.plusDays(2)),
                buildRecord(100, base.plusDays(3)),
                buildRecord(100, base.plusDays(4)),
                buildRecord(100, base.plusDays(5)),
                buildRecord(100, base.plusDays(6))
        ));

        // Extreme outlier — 1000x the average
        records.add(buildRecord(100000, base.plusDays(7)));

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, null, null, null);

        assertThat(result).allMatch(a ->
                a.getSeverityScore() >= 0.0 && a.getSeverityScore() <= 1.0);
    }

    // ── Bonus: Identical amounts → no HIGH_AMOUNT anomalies ─────────

    @Test
    @DisplayName("detectAnomalies — all identical amounts returns no HIGH_AMOUNT anomalies")
    void detectAnomalies_identicalAmounts_noHighAmountAnomalies() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = List.of(
                buildRecord(5000, base),
                buildRecord(5000, base.plusDays(1)),
                buildRecord(5000, base.plusDays(2)),
                buildRecord(5000, base.plusDays(3)),
                buildRecord(5000, base.plusDays(4))
        );

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, AnomalyType.HIGH_AMOUNT, null, null);

        assertThat(result).isEmpty();
    }

    // ── Bonus: Results sorted by severityScore descending ───────────

    @Test
    @DisplayName("detectAnomalies — results are sorted by severityScore descending")
    void detectAnomalies_resultsSortedBySeverityDescending() {
        LocalDate base = LocalDate.of(2025, 3, 1);

        List<FinancialRecord> records = new ArrayList<>(List.of(
                buildRecord(1000, base),
                buildRecord(1000, base.plusDays(1)),
                buildRecord(1000, base.plusDays(2)),
                buildRecord(1000, base.plusDays(3)),
                buildRecord(1000, base.plusDays(4)),
                buildRecord(1000, base.plusDays(5)),
                buildRecord(1000, base.plusDays(6)),
                buildRecord(1000, base.plusDays(7)),
                buildRecord(1000, base.plusDays(8))
        ));

        // Two outliers with different severities
        records.add(buildRecord(10000, base.plusDays(9)));
        records.add(buildRecord(50000, base.plusDays(10)));

        when(recordRepository.findByCreatedBy(testUser)).thenReturn(records);

        List<AnomalyResponseDTO> result = anomalyDetectionService.detectAnomalies(
                testUser, null, null, null);

        if (result.size() >= 2) {
            for (int i = 0; i < result.size() - 1; i++) {
                assertThat(result.get(i).getSeverityScore())
                        .isGreaterThanOrEqualTo(result.get(i + 1).getSeverityScore());
            }
        }
    }
}
