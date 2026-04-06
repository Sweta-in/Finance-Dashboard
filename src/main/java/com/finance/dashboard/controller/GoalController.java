package com.finance.dashboard.controller;

import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.dto.request.AddSavingsRequestDTO;
import com.finance.dashboard.dto.request.GoalRequestDTO;
import com.finance.dashboard.dto.response.GoalResponseDTO;
import com.finance.dashboard.dto.response.wrapper.ApiResponse;
import com.finance.dashboard.service.GoalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
@SecurityRequirement(name = "BearerAuth")
@Tag(name = "Goals", description = "Savings goals management for all authenticated users")
public class GoalController {

    private final GoalService goalService;

    @GetMapping
    @Operation(summary = "List all goals",
            description = "Returns all savings goals for the authenticated user, ordered by creation date descending")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
            description = "Goals retrieved successfully")
    public ResponseEntity<ApiResponse<List<GoalResponseDTO>>> getAllGoals(
            @AuthenticationPrincipal User currentUser) {

        List<GoalResponseDTO> goals = goalService.getAllGoals(currentUser.getId());

        String message = goals.isEmpty()
                ? "No goals found"
                : goals.size() + " goal(s) retrieved";

        return ResponseEntity.ok(
                ApiResponse.success(goals, message, "/api/v1/goals"));
    }

    @PostMapping
    @Operation(summary = "Create a new goal",
            description = "Creates a new savings goal for the authenticated user")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201",
            description = "Goal created successfully")
    public ResponseEntity<ApiResponse<GoalResponseDTO>> createGoal(
            @Valid @RequestBody GoalRequestDTO request,
            @AuthenticationPrincipal User currentUser) {

        GoalResponseDTO goal = goalService.createGoal(
                currentUser.getId(), request, currentUser);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(goal, "Goal created successfully",
                        "/api/v1/goals"));
    }

    @PostMapping("/{id}/savings")
    @Operation(summary = "Add savings to a goal",
            description = "Adds a savings amount to an existing goal. Auto-completes the goal if saved amount reaches or exceeds the target.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
            description = "Savings added successfully")
    public ResponseEntity<ApiResponse<GoalResponseDTO>> addSavings(
            @PathVariable Long id,
            @Valid @RequestBody AddSavingsRequestDTO request,
            @AuthenticationPrincipal User currentUser) {

        GoalResponseDTO goal = goalService.addSavings(
                currentUser.getId(), id, request);

        return ResponseEntity.ok(
                ApiResponse.success(goal, "Savings added successfully",
                        "/api/v1/goals/" + id + "/savings"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a goal",
            description = "Updates the name, icon, target amount, and deadline of an existing goal")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200",
            description = "Goal updated successfully")
    public ResponseEntity<ApiResponse<GoalResponseDTO>> updateGoal(
            @PathVariable Long id,
            @Valid @RequestBody GoalRequestDTO request,
            @AuthenticationPrincipal User currentUser) {

        GoalResponseDTO goal = goalService.updateGoal(
                currentUser.getId(), id, request);

        return ResponseEntity.ok(
                ApiResponse.success(goal, "Goal updated successfully",
                        "/api/v1/goals/" + id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a goal",
            description = "Permanently deletes a savings goal belonging to the authenticated user")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "204",
            description = "Goal deleted successfully")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {

        goalService.deleteGoal(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
