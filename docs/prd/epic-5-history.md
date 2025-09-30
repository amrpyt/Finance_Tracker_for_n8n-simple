# Epic 5: Transaction History & Data Management

**Version:** 1.0  
**Date:** 2025-09-30  
**Epic ID:** Epic 5

---

## Goal

Provide users with comprehensive transaction history viewing, editing, and deletion capabilities for complete financial data control. This epic ensures users can review past transactions, correct errors, and maintain accurate financial records, building trust in the system.

---

## Story 5.1: View Recent Transaction History

**As a** user,  
**I want** to view my recent transactions,  
**so that** I can review my spending and income.

### Acceptance Criteria

1. Convex query `getRecentTransactions` retrieves last 20 transactions for a user, sorted by date descending
2. Bot responds to commands like "show transactions", "history", "عرض المعاملات"
3. Response formatted as list with date, type (expense/income), amount, description, account
4. Expenses shown with 💸 emoji, income with 💰 emoji
5. Each transaction numbered for easy reference (e.g., "1. 2025-09-30: 💸 50 EGP - coffee (Main Bank)")
6. Empty state handled (e.g., "No transactions yet. Start by logging an expense!")
7. Response paginated if more than 20 transactions (with "show more" option)

---

## Story 5.2: Filter Transactions by Date Range

**As a** user,  
**I want** to view transactions from a specific time period,  
**so that** I can analyze my spending for a particular week or month.

### Acceptance Criteria

1. Bot detects date range filters from messages like "show last week", "transactions this month", "معاملات الشهر الماضي"
2. AI extracts date range (start and end dates) from user message
3. Convex query filters transactions by date range
4. Response includes date range in header (e.g., "Transactions from 2025-09-01 to 2025-09-30:")
5. Total expenses and income for period calculated and displayed
6. Net change (income - expenses) shown at end
7. Handles relative dates (today, yesterday, last week, this month) and absolute dates (2025-09-15)

---

## Story 5.3: Edit Transaction Details

**As a** user,  
**I want** to correct a transaction if I made a mistake,  
**so that** my financial records are accurate.

### Acceptance Criteria

1. Convex mutation `updateTransaction` accepts transaction ID and updated fields (amount, description, category)
2. Bot responds to commands like "edit transaction 3" or "change last transaction"
3. Bot displays current transaction details and asks what to change
4. User can specify new amount, description, or category
5. Account balance adjusted to reflect the change (difference between old and new amount)
6. Confirmation message shows old and new values (e.g., "Updated: 50 EGP → 55 EGP for 'coffee'")
7. Edit timestamp logged for audit trail

---

## Story 5.4: Delete Transaction

**As a** user,  
**I want** to delete a transaction if it was logged incorrectly,  
**so that** my records don't include erroneous data.

### Acceptance Criteria

1. Convex mutation `deleteTransaction` accepts transaction ID and marks as deleted (soft delete)
2. Bot responds to commands like "delete transaction 5" or "remove last transaction"
3. Bot displays transaction details and asks for confirmation before deleting
4. On confirmation, transaction marked as deleted (not physically removed from database)
5. Account balance adjusted to reverse the transaction
6. Confirmation message sent (e.g., "✅ Deleted: 50 EGP for 'coffee'. Balance updated to 3000 EGP")
7. Deleted transactions excluded from history views but retained in database for audit

---

## Story 5.5: Transaction Search by Description

**As a** user,  
**I want** to search for transactions by keyword,  
**so that** I can quickly find specific expenses or income.

### Acceptance Criteria

1. Convex query `searchTransactions` accepts search term and filters by description
2. Bot responds to commands like "find coffee transactions" or "ابحث عن مواصلات"
3. Search is case-insensitive and supports partial matches
4. Results formatted as numbered list with date, amount, description, account
5. Result count displayed (e.g., "Found 5 transactions matching 'coffee':")
6. Empty result handled (e.g., "No transactions found matching 'coffee'")
7. Search works in both Arabic and English

---

**Related Documents:**
- [Epic List](./epics.md)
- [Epic 4: Loans](./epic-4-loans.md)
- [Requirements](./requirements.md)
- [Overview](./overview.md)
