package com.finance.dashboard.config;

import com.finance.dashboard.domain.entity.FinancialRecord;
import com.finance.dashboard.domain.entity.User;
import com.finance.dashboard.domain.enums.RecordType;
import com.finance.dashboard.domain.enums.Role;
import com.finance.dashboard.domain.enums.UserStatus;
import com.finance.dashboard.repository.FinancialRecordRepository;
import com.finance.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@Profile({"dev", "local"})
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FinancialRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded — skipping.");
            return;
        }

        log.info("Seeding database with initial data...");

        // ── Users ────────────────────────────────────────────────
        User admin = userRepository.save(User.builder()
                .name("Admin User")
                .email("admin@finance.dev")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        userRepository.save(User.builder()
                .name("Analyst User")
                .email("analyst@finance.dev")
                .passwordHash(passwordEncoder.encode("Analyst@123"))
                .role(Role.ANALYST)
                .status(UserStatus.ACTIVE)
                .build());

        userRepository.save(User.builder()
                .name("Viewer User")
                .email("viewer@finance.dev")
                .passwordHash(passwordEncoder.encode("Viewer@123"))
                .role(Role.VIEWER)
                .status(UserStatus.ACTIVE)
                .build());

        userRepository.save(User.builder()
                .name("Inactive User")
                .email("inactive@finance.dev")
                .passwordHash(passwordEncoder.encode("Test@123"))
                .role(Role.VIEWER)
                .status(UserStatus.INACTIVE)
                .build());

        log.info("Seeded 4 users");

        // ── Financial Records (30 fintech-relevant) ────────────────
        List<FinancialRecord> records = List.of(
                // INCOME records (12)
                record(new BigDecimal("185000.00"), RecordType.INCOME, "UPI Collection",
                        LocalDate.of(2025, 1, 5), "Monthly UPI merchant settlement",
                        "TXN-2025-00000001", admin),
                record(new BigDecimal("220000.00"), RecordType.INCOME, "API Gateway Revenue",
                        LocalDate.of(2025, 1, 18), "REST API usage billing revenue",
                        "TXN-2025-00000002", admin),
                record(new BigDecimal("85000.00"), RecordType.INCOME, "Consulting Fee",
                        LocalDate.of(2025, 2, 8), "Backend architecture consulting",
                        "TXN-2025-00000003", admin),
                record(new BigDecimal("12500.00"), RecordType.INCOME, "Interest Credit",
                        LocalDate.of(2025, 2, 28), "Savings account interest",
                        "TXN-2025-00000004", admin),
                record(new BigDecimal("145000.00"), RecordType.INCOME, "Freelance Contract",
                        LocalDate.of(2025, 3, 12), "React dashboard development contract",
                        "TXN-2025-00000005", admin),
                record(new BigDecimal("18000.00"), RecordType.INCOME, "Refund Received",
                        LocalDate.of(2025, 3, 25), "Vendor overpayment refund",
                        "TXN-2025-00000006", admin),
                record(new BigDecimal("95000.00"), RecordType.INCOME, "Investment Return",
                        LocalDate.of(2025, 4, 7), "Mutual fund quarterly return",
                        "TXN-2025-00000007", admin),
                record(new BigDecimal("210000.00"), RecordType.INCOME, "UPI Collection",
                        LocalDate.of(2025, 4, 20), "UPI merchant settlement Q2",
                        "TXN-2025-00000008", admin),
                record(new BigDecimal("175000.00"), RecordType.INCOME, "API Gateway Revenue",
                        LocalDate.of(2025, 5, 10), "API monetization revenue",
                        "TXN-2025-00000009", admin),
                record(new BigDecimal("92000.00"), RecordType.INCOME, "Consulting Fee",
                        LocalDate.of(2025, 5, 22), "System design consulting session",
                        "TXN-2025-00000010", admin),
                record(new BigDecimal("150000.00"), RecordType.INCOME, "Salary Credit",
                        LocalDate.of(2025, 6, 1), "Monthly salary disbursement",
                        "TXN-2025-00000011", admin),
                record(new BigDecimal("68000.00"), RecordType.INCOME, "Freelance Contract",
                        LocalDate.of(2025, 6, 15), "Mobile app backend contract",
                        "TXN-2025-00000012", admin),

                // EXPENSE records (18)
                record(new BigDecimal("45000.00"), RecordType.EXPENSE, "AWS EC2 Instance",
                        LocalDate.of(2025, 1, 3), "t3.medium instance — payment service",
                        "TXN-2025-00000013", admin),
                record(new BigDecimal("12000.00"), RecordType.EXPENSE, "RDS Storage",
                        LocalDate.of(2025, 1, 10), "db.t3.micro PostgreSQL instance",
                        "TXN-2025-00000014", admin),
                record(new BigDecimal("3200.00"), RecordType.EXPENSE, "GitHub Actions",
                        LocalDate.of(2025, 1, 15), "CI/CD pipeline — 3 repositories",
                        "TXN-2025-00000015", admin),
                record(new BigDecimal("8500.00"), RecordType.EXPENSE, "Razorpay Gateway Fee",
                        LocalDate.of(2025, 1, 28), "2.5% on ₹3.4L payment volume",
                        "TXN-2025-00000016", admin),
                record(new BigDecimal("47000.00"), RecordType.EXPENSE, "AWS EC2 Instance",
                        LocalDate.of(2025, 2, 3), "t3.medium upscale — traffic spike",
                        "TXN-2025-00000017", admin),
                record(new BigDecimal("2999.00"), RecordType.EXPENSE, "Office Broadband",
                        LocalDate.of(2025, 2, 10), "Office fiber 100Mbps plan",
                        "TXN-2025-00000018", admin),
                record(new BigDecimal("1800.00"), RecordType.EXPENSE, "Zoom Pro License",
                        LocalDate.of(2025, 2, 14), "Team video conferencing",
                        "TXN-2025-00000019", admin),
                record(new BigDecimal("4200.00"), RecordType.EXPENSE, "Postman Team Plan",
                        LocalDate.of(2025, 2, 20), "API development workspace",
                        "TXN-2025-00000020", admin),
                record(new BigDecimal("13500.00"), RecordType.EXPENSE, "RDS Storage",
                        LocalDate.of(2025, 3, 5), "db.t3.small storage upgrade",
                        "TXN-2025-00000021", admin),
                record(new BigDecimal("9200.00"), RecordType.EXPENSE, "Razorpay Gateway Fee",
                        LocalDate.of(2025, 3, 18), "3.1% on ₹2.97L payment volume",
                        "TXN-2025-00000022", admin),
                record(new BigDecimal("52000.00"), RecordType.EXPENSE, "AWS EC2 Instance",
                        LocalDate.of(2025, 4, 3), "t3.large — load test preparation",
                        "TXN-2025-00000023", admin),
                record(new BigDecimal("1500.00"), RecordType.EXPENSE, "Docker Hub Pro",
                        LocalDate.of(2025, 4, 12), "Container registry pro plan",
                        "TXN-2025-00000024", admin),
                record(new BigDecimal("3800.00"), RecordType.EXPENSE, "GitHub Actions",
                        LocalDate.of(2025, 5, 5), "CI/CD — added 2 repositories",
                        "TXN-2025-00000025", admin),
                record(new BigDecimal("2999.00"), RecordType.EXPENSE, "Office Broadband",
                        LocalDate.of(2025, 5, 10), "Office fiber renewal",
                        "TXN-2025-00000026", admin),
                record(new BigDecimal("14200.00"), RecordType.EXPENSE, "RDS Storage",
                        LocalDate.of(2025, 5, 20), "Storage auto-scaling triggered",
                        "TXN-2025-00000027", admin),
                record(new BigDecimal("49000.00"), RecordType.EXPENSE, "AWS EC2 Instance",
                        LocalDate.of(2025, 6, 3), "t3.large steady state billing",
                        "TXN-2025-00000028", admin),
                record(new BigDecimal("11000.00"), RecordType.EXPENSE, "Razorpay Gateway Fee",
                        LocalDate.of(2025, 6, 18), "2.8% on ₹3.93L payment volume",
                        "TXN-2025-00000029", admin),
                record(new BigDecimal("4200.00"), RecordType.EXPENSE, "Postman Team Plan",
                        LocalDate.of(2025, 6, 25), "API workspace renewal",
                        "TXN-2025-00000030", admin)
        );

        recordRepository.saveAll(records);
        log.info("Seeded {} financial records", records.size());
        log.info("Database seeding completed successfully.");
    }

    private FinancialRecord record(BigDecimal amount, RecordType type, String category,
                                    LocalDate recordDate, String notes,
                                    String transactionRef, User createdBy) {
        return FinancialRecord.builder()
                .amount(amount)
                .type(type)
                .category(category)
                .recordDate(recordDate)
                .notes(notes)
                .transactionRef(transactionRef)
                .createdBy(createdBy)
                .isDeleted(false)
                .build();
    }
}

