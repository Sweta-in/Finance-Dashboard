package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.AnomalyType;
import com.finance.dashboard.dto.response.AnomalyResponseDTO;
import com.finance.dashboard.repository.FinancialRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AnomalyDetectionService {

    private static final double Z_SCORE_THRESHOLD = 2.0;
    private static final double SPIKE_MULTIPLIER = 3.0;
    private static final int ROLLING_WINDOW_DAYS = 7;

    private final FinancialRecordRepository recordRepository;

    public AnomalyDetectionService(FinancialRecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    /**
     * Detects anomalies across all records for the authenticated user.
     * Supports optional filtering by anomaly type and date range.
     * Filters are applied AFTER detection so that statistical baselines
     * are computed from the full dataset.
     */
    @Transactional(readOnly = true)
    public List<AnomalyResponseDTO> detectAnomalies(User user, AnomalyType typeFilter,
                                                     LocalDate from, LocalDate to) {
        List<FinancialRecord> allRecords = recordRepository.findByCreatedBy(user);
        log.info("Anomaly detection started — {} total records scanned for user {}", allRecords.size(), user.getEmail());

        if (allRecords.isEmpty()) {
            log.info("No records found, skipping anomaly detection");
            return Collections.emptyList();
        }

        Map<UUID, AnomalyResponseDTO> anomalyMap = new LinkedHashMap<>();

        // Run both detectors unless a specific type is requested
        if (typeFilter == null || typeFilter == AnomalyType.HIGH_AMOUNT) {
            List<AnomalyResponseDTO> highAmount = detectHighAmountAnomalies(allRecords);
            for (AnomalyResponseDTO a : highAmount) {
                anomalyMap.merge(a.getRecordId(), a, (existing, incoming) ->
                        incoming.getSeverityScore() > existing.getSeverityScore() ? incoming : existing);
            }
        }

        if (typeFilter == null || typeFilter == AnomalyType.SUDDEN_SPIKE) {
            List<AnomalyResponseDTO> spikes = detectSuddenSpikes(allRecords);
            for (AnomalyResponseDTO a : spikes) {
                anomalyMap.merge(a.getRecordId(), a, (existing, incoming) ->
                        incoming.getSeverityScore() > existing.getSeverityScore() ? incoming : existing);
            }
        }

        // Apply date and type filters AFTER detection
        List<AnomalyResponseDTO> results = anomalyMap.values().stream()
                .filter(a -> from == null || !a.getDate().isBefore(from))
                .filter(a -> to == null || !a.getDate().isAfter(to))
                .filter(a -> typeFilter == null || a.getAnomalyType() == typeFilter)
                .sorted(Comparator.comparingDouble(AnomalyResponseDTO::getSeverityScore).reversed())
                .collect(Collectors.toList());

        log.info("Anomaly detection finished — {} anomalies found out of {} records", results.size(), allRecords.size());
        return results;
    }

    /**
     * Z-score method: flags any transaction whose absolute amount is more than
     * Z_SCORE_THRESHOLD standard deviations above the user's mean amount.
     *
     * z = (|x| - μ) / σ
     * severityScore = min((|x| - μ) / (3 * σ), 1.0)
     */
    List<AnomalyResponseDTO> detectHighAmountAnomalies(List<FinancialRecord> allRecords) {
        double mean = calculateMean(allRecords);
        double stdDev = calculateStdDev(allRecords, mean);

        log.debug("Z-score stats — mean: {}, stdDev: {}", mean, stdDev);

        if (stdDev == 0.0) {
            return Collections.emptyList();
        }

        List<AnomalyResponseDTO> anomalies = new ArrayList<>();
        for (FinancialRecord record : allRecords) {
            double amount = Math.abs(record.getAmount().doubleValue());

            // z = (amount - mean) / stdDev — measures how many std devs above mean
            double zScore = (amount - mean) / stdDev;

            if (zScore > Z_SCORE_THRESHOLD) {
                // severityScore = min((amount - mean) / (3 * stdDev), 1.0)
                double severity = Math.min((amount - mean) / (3 * stdDev), 1.0);

                anomalies.add(AnomalyResponseDTO.builder()
                        .recordId(record.getId())
                        .amount(record.getAmount())
                        .date(record.getRecordDate())
                        .description(record.getNotes())
                        .anomalyType(AnomalyType.HIGH_AMOUNT)
                        .severityScore(roundSeverity(severity))
                        .anomalyDescription(String.format("Amount is %.1fx above your average", amount / mean))
                        .build());
            }
        }
        return anomalies;
    }

    /**
     * Rolling window spike detection: for each record, calculates the average
     * of transactions in the 7 days prior. Flags any record whose absolute amount
     * exceeds SPIKE_MULTIPLIER × that 7-day rolling average.
     *
     * ratio = |amount| / rollingAvg
     * severityScore = min((ratio - 3) / 7.0, 1.0)
     */
    List<AnomalyResponseDTO> detectSuddenSpikes(List<FinancialRecord> allRecords) {
        List<FinancialRecord> sorted = allRecords.stream()
                .sorted(Comparator.comparing(FinancialRecord::getRecordDate))
                .collect(Collectors.toList());

        List<AnomalyResponseDTO> anomalies = new ArrayList<>();

        for (FinancialRecord candidate : sorted) {
            LocalDate candidateDate = candidate.getRecordDate();
            LocalDate windowStart = candidateDate.minusDays(ROLLING_WINDOW_DAYS);

            // Collect amounts in the 7-day window BEFORE this transaction's date
            List<BigDecimal> windowAmounts = sorted.stream()
                    .filter(r -> !r.getId().equals(candidate.getId()))
                    .filter(r -> !r.getRecordDate().isBefore(windowStart))
                    .filter(r -> r.getRecordDate().isBefore(candidateDate))
                    .map(r -> r.getAmount().abs())
                    .collect(Collectors.toList());

            if (windowAmounts.isEmpty()) {
                continue;
            }

            // rollingAvg = average of absolute amounts in the 7-day window
            double rollingAvg = windowAmounts.stream()
                    .mapToDouble(BigDecimal::doubleValue)
                    .average()
                    .orElse(0.0);

            if (rollingAvg == 0.0) {
                continue;
            }

            double amount = Math.abs(candidate.getAmount().doubleValue());
            double ratio = amount / rollingAvg;

            if (ratio > SPIKE_MULTIPLIER) {
                // severityScore = min((ratio - 3) / 7.0, 1.0)
                double severity = Math.min((ratio - SPIKE_MULTIPLIER) / 7.0, 1.0);

                anomalies.add(AnomalyResponseDTO.builder()
                        .recordId(candidate.getId())
                        .amount(candidate.getAmount())
                        .date(candidate.getRecordDate())
                        .description(candidate.getNotes())
                        .anomalyType(AnomalyType.SUDDEN_SPIKE)
                        .severityScore(roundSeverity(severity))
                        .anomalyDescription(String.format("Amount is %.1fx above your 7-day average", ratio))
                        .build());
            }
        }
        return anomalies;
    }

    // ── Private helpers ────────────────────────────────────────────

    private double calculateMean(List<FinancialRecord> records) {
        return records.stream()
                .mapToDouble(r -> Math.abs(r.getAmount().doubleValue()))
                .average()
                .orElse(0.0);
    }

    /**
     * Population standard deviation: σ = sqrt( Σ(|xi| - μ)² / N )
     * Uses population (not sample) because we have the full dataset.
     */
    private double calculateStdDev(List<FinancialRecord> records, double mean) {
        double variance = records.stream()
                .mapToDouble(r -> Math.abs(r.getAmount().doubleValue()))
                .map(val -> Math.pow(val - mean, 2))
                .average()
                .orElse(0.0);
        return Math.sqrt(variance);
    }

    private double roundSeverity(double severity) {
        return BigDecimal.valueOf(severity)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
