package com.finance.dashboard.repository;

import com.finance.dashboard.domain.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Goal> findByIdAndUserId(Long id, UUID userId);
}
