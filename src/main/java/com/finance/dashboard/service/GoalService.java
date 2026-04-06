package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.Goal;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.GoalStatus;
import com.finance.dashboard.dto.request.AddSavingsRequestDTO;
import com.finance.dashboard.dto.request.GoalRequestDTO;
import com.finance.dashboard.dto.response.GoalResponseDTO;
import com.finance.dashboard.exception.ResourceNotFoundException;
import com.finance.dashboard.repository.GoalRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GoalService {

    private final GoalRepository goalRepository;

    public GoalService(GoalRepository goalRepository) {
        this.goalRepository = goalRepository;
    }

    // ── Read ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GoalResponseDTO> getAllGoals(UUID userId) {
        log.debug("Fetching all goals for userId={}", userId);
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return goals.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    // ── Create ───────────────────────────────────────────────────────

    @Transactional
    public GoalResponseDTO createGoal(UUID userId, GoalRequestDTO dto, User user) {
        Goal goal = Goal.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .targetAmount(dto.getTargetAmount())
                .savedAmount(0.0)
                .deadline(dto.getDeadline())
                .status(GoalStatus.ACTIVE)
                .user(user)
                .build();

        Goal saved = goalRepository.save(goal);
        log.info("Goal created: id={}, name='{}', target={}, userId={}",
                saved.getId(), saved.getName(), saved.getTargetAmount(), userId);

        return toResponseDTO(saved);
    }

    // ── Add Savings ──────────────────────────────────────────────────

    @Transactional
    public GoalResponseDTO addSavings(UUID userId, Long goalId, AddSavingsRequestDTO dto) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        double newSavedAmount = goal.getSavedAmount() + dto.getAmount();
        goal.setSavedAmount(newSavedAmount);

        // Auto-complete when savings meet or exceed target
        if (newSavedAmount >= goal.getTargetAmount()) {
            goal.setStatus(GoalStatus.COMPLETED);
            log.info("Goal auto-completed: id={}, saved={}, target={}",
                    goalId, newSavedAmount, goal.getTargetAmount());
        }

        Goal updated = goalRepository.save(goal);
        log.info("Savings added to goal: id={}, amount={}, newTotal={}, userId={}",
                goalId, dto.getAmount(), newSavedAmount, userId);

        return toResponseDTO(updated);
    }

    // ── Update ───────────────────────────────────────────────────────

    @Transactional
    public GoalResponseDTO updateGoal(UUID userId, Long goalId, GoalRequestDTO dto) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        goal.setName(dto.getName());
        goal.setIcon(dto.getIcon());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setDeadline(dto.getDeadline());

        Goal updated = goalRepository.save(goal);
        log.info("Goal updated: id={}, userId={}", goalId, userId);

        return toResponseDTO(updated);
    }

    // ── Delete ───────────────────────────────────────────────────────

    @Transactional
    public void deleteGoal(UUID userId, Long goalId) {
        Goal goal = goalRepository.findByIdAndUserId(goalId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal", "id", goalId));

        goalRepository.delete(goal);
        log.info("Goal deleted: id={}, userId={}", goalId, userId);
    }

    // ── Mapping ──────────────────────────────────────────────────────

    private GoalResponseDTO toResponseDTO(Goal goal) {
        long daysLeft = 0;
        if (goal.getDeadline() != null) {
            daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), goal.getDeadline());
            if (daysLeft < 0) {
                daysLeft = 0;
            }
        }

        double percent = 0.0;
        if (goal.getTargetAmount() != null && goal.getTargetAmount() > 0) {
            percent = (goal.getSavedAmount() / goal.getTargetAmount()) * 100.0;
            if (percent > 100.0) {
                percent = 100.0;
            }
        }

        double remaining = goal.getTargetAmount() - goal.getSavedAmount();
        if (remaining < 0) {
            remaining = 0.0;
        }

        return GoalResponseDTO.builder()
                .id(goal.getId())
                .name(goal.getName())
                .icon(goal.getIcon())
                .targetAmount(goal.getTargetAmount())
                .savedAmount(goal.getSavedAmount())
                .deadline(goal.getDeadline())
                .status(goal.getStatus())
                .daysLeft(daysLeft)
                .percentComplete(Math.round(percent * 100.0) / 100.0)
                .remainingAmount(remaining)
                .build();
    }
}
