package com.finance.dashboard.service;

import com.finance.dashboard.domain.entity.Goal;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.GoalStatus;
import com.finance.dashboard.domain.enums.Role;
import com.finance.dashboard.domain.enums.UserStatus;
import com.finance.dashboard.dto.request.AddSavingsRequestDTO;
import com.finance.dashboard.dto.request.GoalRequestDTO;
import com.finance.dashboard.dto.response.GoalResponseDTO;
import com.finance.dashboard.exception.ResourceNotFoundException;
import com.finance.dashboard.repository.GoalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("GoalService Unit Tests")
class GoalServiceTest {

    @Mock
    private GoalRepository goalRepository;

    @InjectMocks
    private GoalService goalService;

    private User testUser;
    private UUID testUserId;

    @BeforeEach
    void setUp() {
        testUserId = UUID.randomUUID();
        testUser = User.builder()
                .id(testUserId)
                .name("Test User")
                .email("user@finance.dev")
                .passwordHash("encoded-password")
                .role(Role.VIEWER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    // ── Helper ────────────────────────────────────────────────────────

    private Goal buildGoal(Long id, String name, double target, double saved,
                           GoalStatus status, LocalDate deadline) {
        LocalDateTime now = LocalDateTime.now();
        return Goal.builder()
                .id(id)
                .name(name)
                .icon("emergency")
                .targetAmount(target)
                .savedAmount(saved)
                .deadline(deadline)
                .status(status)
                .user(testUser)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    // ── 1. getAllGoals returns list for user ──────────────────────────

    @Test
    @DisplayName("getAllGoals — returns list of goals for authenticated user")
    void getAllGoals_returnsListForUser() {
        LocalDate deadline = LocalDate.now().plusMonths(6);
        List<Goal> goals = List.of(
                buildGoal(1L, "Emergency Fund", 50000.0, 15000.0, GoalStatus.ACTIVE, deadline),
                buildGoal(2L, "Vacation", 20000.0, 20000.0, GoalStatus.COMPLETED, deadline)
        );

        when(goalRepository.findByUserIdOrderByCreatedAtDesc(testUserId)).thenReturn(goals);

        List<GoalResponseDTO> result = goalService.getAllGoals(testUserId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Emergency Fund");
        assertThat(result.get(1).getName()).isEqualTo("Vacation");
        verify(goalRepository).findByUserIdOrderByCreatedAtDesc(testUserId);
    }

    // ── 2. createGoal persists and returns DTO ───────────────────────

    @Test
    @DisplayName("createGoal — persists new goal and returns response DTO")
    void createGoal_persistsAndReturnsDTO() {
        GoalRequestDTO dto = GoalRequestDTO.builder()
                .name("New Laptop")
                .icon("laptop")
                .targetAmount(80000.0)
                .deadline(LocalDate.now().plusMonths(3))
                .build();

        LocalDateTime now = LocalDateTime.now();
        Goal savedGoal = Goal.builder()
                .id(1L)
                .name("New Laptop")
                .icon("laptop")
                .targetAmount(80000.0)
                .savedAmount(0.0)
                .deadline(dto.getDeadline())
                .status(GoalStatus.ACTIVE)
                .user(testUser)
                .createdAt(now)
                .updatedAt(now)
                .build();

        when(goalRepository.save(any(Goal.class))).thenReturn(savedGoal);

        GoalResponseDTO result = goalService.createGoal(testUserId, dto, testUser);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("New Laptop");
        assertThat(result.getIcon()).isEqualTo("laptop");
        assertThat(result.getTargetAmount()).isEqualTo(80000.0);
        assertThat(result.getSavedAmount()).isEqualTo(0.0);
        assertThat(result.getStatus()).isEqualTo(GoalStatus.ACTIVE);
        verify(goalRepository).save(any(Goal.class));
    }

    // ── 3. addSavings updates savedAmount correctly ──────────────────

    @Test
    @DisplayName("addSavings — updates savedAmount correctly")
    void addSavings_updatesSavedAmountCorrectly() {
        Long goalId = 1L;
        Goal goal = buildGoal(goalId, "Emergency Fund", 50000.0, 10000.0,
                GoalStatus.ACTIVE, LocalDate.now().plusMonths(6));

        when(goalRepository.findByIdAndUserId(goalId, testUserId)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        AddSavingsRequestDTO dto = AddSavingsRequestDTO.builder().amount(5000.0).build();

        GoalResponseDTO result = goalService.addSavings(testUserId, goalId, dto);

        assertThat(result.getSavedAmount()).isEqualTo(15000.0);
        assertThat(result.getStatus()).isEqualTo(GoalStatus.ACTIVE);
        verify(goalRepository).save(any(Goal.class));
    }

    // ── 4. addSavings auto-completes goal ────────────────────────────

    @Test
    @DisplayName("addSavings — auto-completes goal when savedAmount >= targetAmount")
    void addSavings_autoCompletesGoal() {
        Long goalId = 1L;
        Goal goal = buildGoal(goalId, "Vacation", 20000.0, 18000.0,
                GoalStatus.ACTIVE, LocalDate.now().plusMonths(2));

        when(goalRepository.findByIdAndUserId(goalId, testUserId)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        AddSavingsRequestDTO dto = AddSavingsRequestDTO.builder().amount(3000.0).build();

        GoalResponseDTO result = goalService.addSavings(testUserId, goalId, dto);

        assertThat(result.getSavedAmount()).isEqualTo(21000.0);
        assertThat(result.getStatus()).isEqualTo(GoalStatus.COMPLETED);
    }

    // ── 5. deleteGoal throws ResourceNotFoundException for wrong user ─

    @Test
    @DisplayName("deleteGoal — throws ResourceNotFoundException when goal not found or belongs to another user")
    void deleteGoal_throwsResourceNotFoundForWrongUser() {
        Long goalId = 999L;
        UUID wrongUserId = UUID.randomUUID();

        when(goalRepository.findByIdAndUserId(goalId, wrongUserId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> goalService.deleteGoal(wrongUserId, goalId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Goal")
                .hasMessageContaining("999");

        verify(goalRepository, never()).delete(any(Goal.class));
    }

    // ── 6. percentComplete capped at 100 even if overfunded ─────────

    @Test
    @DisplayName("percentComplete — capped at 100 even if savedAmount exceeds targetAmount")
    void percentComplete_cappedAt100WhenOverfunded() {
        Long goalId = 1L;
        Goal goal = buildGoal(goalId, "Overfunded Goal", 10000.0, 9500.0,
                GoalStatus.ACTIVE, LocalDate.now().plusMonths(1));

        when(goalRepository.findByIdAndUserId(goalId, testUserId)).thenReturn(Optional.of(goal));
        when(goalRepository.save(any(Goal.class))).thenAnswer(inv -> inv.getArgument(0));

        // Add 2000 → total becomes 11500, which exceeds 10000 target
        AddSavingsRequestDTO dto = AddSavingsRequestDTO.builder().amount(2000.0).build();

        GoalResponseDTO result = goalService.addSavings(testUserId, goalId, dto);

        assertThat(result.getSavedAmount()).isEqualTo(11500.0);
        assertThat(result.getPercentComplete()).isEqualTo(100.0);
        assertThat(result.getRemainingAmount()).isEqualTo(0.0);
        assertThat(result.getStatus()).isEqualTo(GoalStatus.COMPLETED);
    }

    // ── Bonus: daysLeft is 0 when deadline has passed ────────────────

    @Test
    @DisplayName("daysLeft — returns 0 when deadline is in the past")
    void daysLeft_returnsZeroForPastDeadline() {
        Goal goal = buildGoal(1L, "Past Goal", 5000.0, 1000.0,
                GoalStatus.ACTIVE, LocalDate.now().minusDays(10));

        when(goalRepository.findByUserIdOrderByCreatedAtDesc(testUserId))
                .thenReturn(List.of(goal));

        List<GoalResponseDTO> result = goalService.getAllGoals(testUserId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDaysLeft()).isEqualTo(0);
    }

    // ── Bonus: updateGoal throws for non-existent goal ───────────────

    @Test
    @DisplayName("updateGoal — throws ResourceNotFoundException for non-existent goal")
    void updateGoal_throwsForNonExistentGoal() {
        Long goalId = 404L;
        GoalRequestDTO dto = GoalRequestDTO.builder()
                .name("Updated")
                .icon("star")
                .targetAmount(10000.0)
                .deadline(LocalDate.now().plusMonths(6))
                .build();

        when(goalRepository.findByIdAndUserId(goalId, testUserId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> goalService.updateGoal(testUserId, goalId, dto))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Goal");
    }
}
