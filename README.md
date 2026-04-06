# Finance Dashboard API

A production-grade REST API for tracking income, expenses, and financial analytics — built with Spring Boot 3, PostgreSQL, and JWT auth. Designed to handle real transactional workloads with ACID guarantees, role-based access, and a clean layered architecture.

## Architecture Overview

```
┌──────────────────┐         ┌──────────────────────────────────────────────┐
│  React Frontend  │         │              Spring Boot 3.2.5               │
│  or  Postman     │ ──────► │                                              │
└──────────────────┘  HTTP   │  Controller ──► Service ──► Repository       │
                      + JWT  │      │              │            │           │
                             │      ▼              ▼            ▼           │
                             │  Validation    Biz Rules    JPA/Hibernate    │
                             │                                              │
                             │  ┌────────────┐    ┌───────────────────┐     │
                             │  │  Security   │    │   Cache Layer     │    │
                             │  │  JWT Auth   │    │ ConcurrentHashMap │    │
                             │  │  RBAC       │    │ + @CacheEvict     │    │
                             │  └────────────┘    └───────────────────┘     │
                             └──────────────┬──────────────────────────────┘
                                            │
                                            ▼
                             ┌──────────────────────────┐
                             │  PostgreSQL 15 (Alpine)  │
                             │  Flyway-managed schema   │
                             │  5 versioned migrations  │
                             └──────────────────────────┘
```

## Tech Stack

| Technology              | Version    | Reason                                                                  |
|-------------------------|------------|-------------------------------------------------------------------------|
| Java                    | 17         | LTS release, records, sealed classes, pattern matching                  |
| Spring Boot             | 3.2.5      | Latest stable — virtual threads ready, GraalVM-friendly                 |
| Spring Security         | 6.x        | Stateless JWT + method-level `@PreAuthorize` for granular RBAC          |
| Spring Data JPA         | 3.x        | JPA Specifications for dynamic filtering without query string building  |
| PostgreSQL              | 15-alpine  | ACID compliance, JSONB support, battle-tested for financial data        |
| Flyway                  | 9.x        | Version-controlled schema — no surprises across environments            |
| MapStruct               | 1.5.5      | Compile-time mapping, zero reflection overhead vs. ModelMapper          |
| Lombok                  | —          | Reduces boilerplate without runtime cost                                |
| JJWT                    | 0.12.6     | HS256 token signing, lightweight and well-maintained                    |
| SpringDoc OpenAPI       | 2.5.0      | Auto-generated Swagger UI from annotations                              |
| Docker                  | Multi-stage| 2-stage build: Maven builder → JRE-only runtime (small image)           |
| H2                      | test-only  | In-memory DB for fast integration tests                                 |

## Quick Start

### Option A — Docker (30 seconds)

```bash
git clone https://github.com/your-username/finance-dashboard.git
cd finance-dashboard
docker-compose up --build
```

That's it. PostgreSQL + the app spin up together. Flyway runs migrations, DataSeeder loads demo data.

- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Health Check:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

### Option B — Local Setup

**Prerequisites:** Java 17+, Maven 3.9+, PostgreSQL 15+

1. **Create the database:**
   ```sql
   CREATE DATABASE financedb;
   ```

2. **Configure environment** (copy `.env.example` or set directly):
   ```bash
   export DB_URL=jdbc:postgresql://localhost:5432/financedb
   export DB_USER=postgres
   export DB_PASS=postgres
   export JWT_SECRET=your-256-bit-secret-here-change-this-in-production
   export SPRING_PROFILES_ACTIVE=local
   ```

3. **Run:**
   ```bash
   mvn clean install -DskipTests
   mvn spring-boot:run
   ```

Flyway handles the schema. DataSeeder populates test data on `dev` and `local` profiles.

## Seeded Accounts

The DataSeeder creates these accounts on startup (dev/local profiles only):

| Email                   | Password       | Role      | Status   |
|-------------------------|----------------|-----------|----------|
| `admin@finance.dev`     | `Admin@123`    | ADMIN     | ACTIVE   |
| `analyst@finance.dev`   | `Analyst@123`  | ANALYST   | ACTIVE   |
| `viewer@finance.dev`    | `Viewer@123`   | VIEWER    | ACTIVE   |
| `inactive@finance.dev`  | `Test@123`     | VIEWER    | INACTIVE |

30 fintech-relevant financial records are also seeded (UPI settlements, AWS costs, Razorpay fees, etc.).

## API Reference

### Authentication — `/api/v1/auth`

| Method | Path               | Auth | Role     | Description                              |
|--------|--------------------|------|----------|------------------------------------------|
| POST   | `/auth/register`   | No   | —        | Register new user, returns JWT           |
| POST   | `/auth/login`      | No   | —        | Login with email/password, returns JWT   |
| GET    | `/auth/me`         | Yes  | Any      | Get current authenticated user profile   |

### Financial Records — `/api/v1/records`

| Method | Path              | Auth | Role     | Description                                          |
|--------|-------------------|------|----------|------------------------------------------------------|
| GET    | `/records`        | Yes  | Any      | List records (paginated, filterable by type/category/date) |
| GET    | `/records/{id}`   | Yes  | Any      | Get single record by UUID                            |
| POST   | `/records`        | Yes  | ADMIN    | Create record (₹1Cr cap, idempotency via `transactionRef`) |
| PUT    | `/records/{id}`   | Yes  | ADMIN    | Update record (optimistic locking via `@Version`)    |
| DELETE | `/records/{id}`   | Yes  | ADMIN    | Soft-delete record (`is_deleted = true`)             |

**Query params for `GET /records`:** `type`, `category`, `from`, `to`, `page`, `size`, `sort`

### User Management — `/api/v1/users`

| Method | Path             | Auth | Role     | Description                                 |
|--------|------------------|------|----------|---------------------------------------------|
| GET    | `/users`         | Yes  | ADMIN    | List users (filterable by role/status)      |
| GET    | `/users/{id}`    | Yes  | ADMIN    | Get user by UUID                            |
| PATCH  | `/users/{id}`    | Yes  | ADMIN    | Update user role/status                     |
| DELETE | `/users/{id}`    | Yes  | ADMIN    | Soft-deactivate user (sets INACTIVE)        |

### Dashboard Analytics — `/api/v1/dashboard`

| Method | Path                  | Auth | Role           | Description                                    |
|--------|-----------------------|------|----------------|------------------------------------------------|
| GET    | `/dashboard/summary`     | Yes  | ANALYST, ADMIN | Income/expense totals, net balance, MoM growth |
| GET    | `/dashboard/by-category` | Yes  | ANALYST, ADMIN | Category breakdown with percentage share       |
| GET    | `/dashboard/trends`      | Yes  | ANALYST, ADMIN | Monthly income/expense trends (last N months)  |
| GET    | `/dashboard/recent`      | Yes  | ANALYST, ADMIN | 10 most recent transactions                    |
| GET    | `/dashboard/high-value`  | Yes  | ANALYST, ADMIN | Transactions above threshold (anomaly flagging)|

## Role Permission Matrix

| Endpoint Group       | VIEWER         | ANALYST              | ADMIN                |
|----------------------|----------------|----------------------|----------------------|
| Auth (login/register)| ✅              | ✅                    | ✅                    |
| Auth (profile)       | ✅ own profile  | ✅ own profile        | ✅ own profile        |
| Records — Read       | ✅              | ✅                    | ✅                    |
| Records — Create     | ❌              | ❌                    | ✅                    |
| Records — Update     | ❌              | ❌                    | ✅                    |
| Records — Delete     | ❌              | ❌                    | ✅                    |
| Dashboard Analytics  | ❌              | ✅                    | ✅                    |
| User Management      | ❌              | ❌                    | ✅                    |

## Design Decisions I Made

**1. Soft delete with `@SQLRestriction` instead of hard delete**

I used Hibernate's `@SQLRestriction("is_deleted = false")` on `FinancialRecord` so that all JPA queries automatically exclude deleted records without any extra `WHERE` clauses in my code. In a finance system, you never truly delete a transaction — audit trails matter. I ran into this exact requirement on the Fintech Transaction Platform where we had to retain every event for compliance, and soft delete was the cleanest way to keep the data while hiding it from business queries.

**2. JPA Specification for dynamic filtering**

The `GET /records` endpoint supports filtering by type, category, date range, and sorting — all optional, in any combination. Instead of writing a dozen `@Query` methods or building raw SQL strings, I used `Specification<FinancialRecord>` to compose predicates at runtime. Each filter (`hasType`, `hasCategory`, `dateFrom`, `dateTo`) is a standalone spec that chains with `.and()`. It's type-safe, testable, and scales way better than the query-string-concatenation approach I've seen break in other projects.

**3. Optimistic locking with `@Version`**

The `FinancialRecord` entity has a `@Version` field. If two admins try to update the same record concurrently, the second one gets an `OptimisticLockException` instead of silently overwriting the first edit. In my Fintech Platform handling 100k events/day, we discovered that pessimistic locks on hot tables were a latency killer — optimistic locking gives you data integrity without holding row-level locks during the entire request lifecycle.

**4. Transaction reference for idempotency**

Every record has a unique `transactionRef`. If a client sends a `POST /records` with the same `transactionRef` that already exists, the API returns the existing record instead of creating a duplicate. If no ref is provided, one is auto-generated (`TXN-YYYY-XXXXXXXX`). This was directly inspired by the payment idempotency keys I implemented on the Fintech Platform — network retries and webhook replays were creating ghost duplicates until we added this.

**5. Cache on dashboard summary + `@CacheEvict` on mutations**

The dashboard summary endpoint (`/dashboard/summary`) is `@Cacheable` because it's the most frequently hit endpoint but the underlying data changes infrequently relative to reads. Every create, update, or delete in `RecordService` triggers `@CacheEvict(value = "dashboardSummary", allEntries = true)`. Currently backed by `ConcurrentMapCacheManager` — simple and sufficient for a single-node deployment. The cache-aside pattern here is straightforward, and swapping in Redis later is a config change, not a rewrite.

**6. Flyway migrations over `ddl-auto`**

I have 5 versioned migration scripts (`V1` through `V5`) managing the schema — from table creation to adding indexes, the `version` column for optimistic locking, and the `transaction_ref` column. Using `ddl-auto=validate` in production means Hibernate checks that entities match the schema but never mutates it. I learned this lesson on the Fintech Platform: `ddl-auto=update` dropped a column index in staging that took us hours to debug. Flyway gives you a Git-like history for your database.

## Business Rules Implemented

- **₹1 Crore single transaction cap** — Any `POST /records` with `amount > ₹1,00,00,000` is rejected with a `BusinessRuleException`. In real fintech, transactions above a threshold require manual compliance review (RBI guidelines). The cap prevents accidental or malicious large entries from polluting the ledger.

- **Auto-generated transaction reference** — If a `transactionRef` is not provided in the request body, one is generated as `TXN-{YEAR}-{8-digit-hash}`. Every record always has a traceable ref.

- **Soft deactivation of users** — `DELETE /users/{id}` sets the user's status to `INACTIVE` rather than removing the row. The `User.isEnabled()` method checks `status == ACTIVE`, so deactivated users can't log in but their historical activity is preserved.

- **Analyst cannot modify records, only read + analyze** — Analysts get full access to dashboard analytics (summary, trends, category breakdown, high-value monitoring) but can't create, update, or delete financial records. This separation exists because in a real finance org, the people running reports shouldn't be the same people entering data.

## What I'd Add at Production Scale

- **Redis for cache** — The current `ConcurrentMapCacheManager` works for a single instance, but the moment you scale to 2+ nodes, each has its own cache and they'll drift. Redis gives you a shared cache, TTL policies, and eviction control. On the Fintech Platform, we used Redis with a 5-minute TTL for dashboard-type reads and it dropped DB load by ~40%.

- **Read replicas for dashboard queries** — Dashboard endpoints run aggregate queries (`SUM`, `GROUP BY`, date range scans) that don't need the latest millisecond of data. Routing those to a PostgreSQL read replica keeps the primary clean for transactional writes. Spring's `@Transactional(readOnly = true)` already marks these — connecting them to a replica is a datasource routing change.

- **Kafka for async audit event streaming** — Right now, audit logging happens synchronously via a servlet filter. At scale, I'd publish audit events to a Kafka topic and consume them asynchronously into a dedicated audit store. This decouples the audit path from request latency — same pattern I used on the Fintech Platform for processing 100k daily events without blocking the main transaction pipeline.

- **Distributed tracing (Micrometer + Zipkin)** — With multiple services, you need request-level tracing. Micrometer is already implicitly available via Spring Boot Actuator. Adding Zipkin or Jaeger as a trace collector would let you trace a request from the JWT filter through the service layer to the DB — invaluable for debugging latency spikes.

- **Rate limiting per user/role** — Currently, any authenticated user can hammer the API without limits. I'd add a `RateLimiter` (Bucket4j or Resilience4j) differentiated by role — maybe 100 req/min for VIEWER, 500 for ANALYST, unlimited for ADMIN. On the Fraud Detection project, rate limiting was a first-class concern to prevent brute-force probing of the risk scoring endpoints.

- **HikariCP tuning for high concurrency** — Spring Boot uses HikariCP by default, but the default pool size (10) will bottleneck under load. For a workload like the Fintech Platform's, I'd tune `maximumPoolSize` based on PostgreSQL's `max_connections`, set `connectionTimeout` to fail fast, and monitor pool metrics via Actuator.

## Assumptions Made

1. **Single-node deployment** — The current caching, session management, and in-memory cache are designed for a single application instance. Multi-node deployment would require Redis and sticky sessions or a shared token store.

2. **BCrypt cost factor of 12 is acceptable** — The `PasswordEncoder` uses `BCryptPasswordEncoder(12)`, which adds ~250ms per hash. This is deliberate — slower hashing = harder brute force — but it means login is never going to be sub-50ms.

3. **All monetary amounts are in INR (₹)** — There's no multi-currency support. Amounts are stored as `BigDecimal(15,2)` and the ₹1 Crore business rule assumes INR.

4. **Seeded data is for demo purposes only** — The `DataSeeder` runs only on `dev` and `local` profiles. Production would start with empty tables and schema-only migrations.

5. **JWT tokens are stateless with no revocation** — Tokens are valid until they expire (24h). There's no token blacklist or refresh token mechanism. For production, I'd add a refresh token flow with sliding expiration.

## Running Tests

```bash
# Run all tests
mvn test

# Run a specific service test
mvn test -Dtest=RecordServiceTest

# Run integration tests
mvn test -Dtest=AuthControllerIntegrationTest
```

Tests use H2 in-memory database (`application-test.yml`) so they don't need a running PostgreSQL instance.
