# Epic 6: Serverless Architecture Migration (Trigger.dev Orchestration)

    ## Overview
    
    Migrate the current bot-server-centric architecture to a fully serverless, reliable, observable orchestration using Trigger.dev. Keep Convex as the single source of truth for data (queries/mutations) while moving all business logic, retries, rate-limiting, orchestration, and background work into Trigger.dev tasks. Telegram webhooks are received by a Convex HTTP Action and forwarded to Trigger.dev with strict idempotency.

- Current: Telegram → Bot Server → Convex → RORK
- Target: Telegram → Convex HTTP Action → Trigger.dev Tasks → Convex (data) + RORK API

```mermaid
    graph TB
      User[ User]
      TG[ Telegram API]
      ConvexHTTP[ Convex HTTP Action]
      Trigger[ Trigger.dev Tasks]
      ConvexDB[ Convex DB]
      RORK[ RORK API]
      
      User --> TG --> ConvexHTTP --> Trigger
      Trigger --> RORK
      Trigger --> ConvexDB
      ConvexHTTP --> TG
    ## Goals

    - Eliminate custom bot server; reduce surface area and ops burden.
    - Centralize orchestration, retries, observability, and queuing in Trigger.dev.
    - Preserve end-user experience and all existing features.
    - Ensure zero/near-zero downtime cutover with explicit rollback plan.

    ## Scope

    - Story 6.1: Trigger.dev foundation and RORK integration validation.
    - Story 6.2: Convex HTTP Actions and Telegram webhook migration with idempotency.
    - Story 6.3: Business Logic migration to Trigger.dev tasks and bot server decommissioning.

    ## Success Metrics

    - p50 < 2s, p95 < 5s for standard interactions.
    - 0 message loss during cutover (verified by audit logs & idempotency keys).
    - 100% of business actions handled by Trigger.dev tasks.
    - Alerting configured for failed runs; dashboard traces available for 100% of runs.

    ## Dependencies

    - Trigger.dev account and project (prod + staging or preview branch).
    - Convex HTTP Actions enabled and publicly reachable URL for Telegram webhook.
    - RORK API key and access from Trigger.dev environment.
    - Environment variables in Trigger.dev: TELEGRAM_BOT_TOKEN, RORK_API_KEY, CONVEX deployment credentials/URLs, and any existing secrets.

    ## Risks & Mitigations

    - Webhook cutover downtime: Mitigate with staging verification and ready-to-revert `setWebhook` to old URL.
    - Double-processing: Prevent via idempotency keys based on Telegram `update_id` and `idempotencyKeyTTL`.
    - ordering/races: Per-user `concurrencyKey` and dedicated `queue` to serialize critical paths.
    - Timeouts: Configure `maxDuration` and use `retry.onThrow()` for granular retries; escalate machine preset as needed.

    ## Rollback Plan

    - Maintain current bot server available until post-cutover validation is complete.
    - Revert Telegram `setWebhook` to previous URL to immediately restore old path.
    - Disable new Convex HTTP Action and pause Trigger.dev tasks.

    ## Acceptance Criteria (Epic)

    - Trigger.dev project configured with `trigger.config.ts`, `dirs` set, default `maxDuration`, console logging in dev.
    - All business logic executed by Trigger.dev tasks with:
      - Task-level `retry` strategies.
      - `idempotencyKey` for Telegram updates.
      - `queue` and `concurrencyKey` for per-user serialization where necessary.
      - `machine` preset chosen for heavier tasks if required.
    - Convex HTTP Action receives Telegram updates and returns 200 fast; defers processing to Trigger.dev.
    - Observability: logs, traces, alerts configured; runs searchable by tags (e.g., `telegram`, `user:{id}`).
    - Cutover completed with zero confirmed message loss and validated fallback.

    ## Constraints & Notes

    - Follow Trigger.dev version locking behavior to ensure deterministic child runs when using `triggerAndWait()`.
    - Use idempotency windows appropriate for Telegram resend patterns.
    - Ensure env vars present in Trigger.dev dashboard before deploy; sync strategy documented.

    ## References (Trigger.dev)

    - Tasks overview: tasks, `retry`, `queue`, `machine`, `maxDuration`.
    - Errors & Retrying: `retry.onThrow`, `AbortTaskRunError`, rate limit handling.
    - Context: run metadata, tags.
    - Versioning & version locking.
    - Deployment: CLI deploy, preview branches.
    - Webhooks: framework-agnostic patterns via Convex HTTP Action.

    ## Story List

    - 6.1 Trigger.dev Foundation & RORK Integration
    - 6.2 Convex HTTP Actions & Telegram Webhook Migration
    - 6.3 Business Logic Migration & Bot Server Decommission
