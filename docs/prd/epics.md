# Epic List - Personal Finance Tracker

**Version:** 1.0  
**Date:** 2025-09-30

---

## Epic Overview

### Epic 1: Foundation & Telegram Bot Setup  ✅ **COMPLETE**

Establish project infrastructure, Telegram bot integration, and basic conversational interface to enable users to interact with the bot and receive responses.

**Status:** ✅ Closed (2025-10-02)  
**Stories:** 5/5 (100%)  
**QA Gates:** 5/5 PASS  
**Details:** [Epic 1 - Foundation](./epic-1-foundation.md) | [Retrospective](../epic-1-retrospective.md)

---

### Epic 2: Account Management & Balance Tracking

Enable users to create and manage multiple financial accounts (bank, cash, credit card) with real-time balance tracking.

**Stories:** 5 stories (2.1 - 2.5)  
**Details:** [Epic 2 - Accounts](./epic-2-accounts.md)

---

### Epic 3: Expense & Income Logging with AI

Implement AI-powered natural language processing to log expenses and income, automatically extracting amounts and descriptions from user messages.

**Stories:** 5 stories (3.1 - 3.5)  
**Details:** [Epic 3 - Transactions](./epic-3-transactions.md)

---

### Epic 4: Loan Tracking & Payment Management

Enable users to track money lent to others, record loan payments, and view outstanding loan balances.

**Stories:** 5 stories (4.1 - 4.5)  
**Details:** [Epic 4 - Loans](./epic-4-loans.md)

### Epic 5: Transaction History & Data Management

Provide users with transaction history viewing, editing, and deletion capabilities for complete financial data control.

**Stories:** 5 stories (5.1 - 5.5)  
**Details:** [Epic 5 - History](./epic-5-history.md)

---

### Epic 6: Serverless Architecture Migration ⚠️ **SUPERSEDED BY EPIC 7**

Migrate to full Trigger.dev orchestration, eliminating the bot server while preserving existing features and using Convex as the data layer.

**Status:** ⚠️ Superseded (2025-10-04) - Replaced by simpler Convex-only approach  
**Stories:** 3 stories (6.1 - 6.3) - Completed but architecture replaced  
**Details:** [Epic 6 - Serverless Architecture Migration](./epic-6-serverless-architecture-migration.md)

**Note:** Epic 6 was successfully implemented but proven unnecessarily complex. Epic 7 achieves the same goals with pure Convex architecture, eliminating Trigger.dev dependency.

---

### Epic 7: Convex-Only Architecture (Serverless Simplification) ✅ **COMPLETE**

Simplify architecture by removing Trigger.dev entirely and implementing all functionality directly in Convex, reducing complexity while maintaining feature parity and adding chart generation.

**Status:** ✅ Complete (2025-10-04)  
**Stories:** 1 story (7.1) - Full migration completed  
**Production:** https://ceaseless-cardinal-528.convex.cloud  
**Details:** [Epic 7 - Convex-Only Architecture](./epic-7-convex-only-architecture.md)

**Key Achievements:**
- Eliminated external orchestration dependency (Trigger.dev)
- Reduced from 13 tasks to 8 streamlined Convex actions
- Added chart generation feature using QuickChart API
- Simplified deployment to single command (`npx convex deploy`)
- Reduced costs by $20-50/month (eliminated Trigger.dev)
- Improved developer experience with single-platform debugging

---

**Related Documents:**
- [Overview](./overview.md)
- [Requirements](./requirements.md)
