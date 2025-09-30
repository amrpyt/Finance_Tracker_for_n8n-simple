# Epic 4: Loan Tracking & Payment Management

**Version:** 1.0  
**Date:** 2025-09-30  
**Epic ID:** Epic 4

---

## Goal

Enable users to track money lent to friends and family, record loan payments, and view outstanding loan balances. This epic addresses a key pain point for Arabic-speaking users where informal lending is common but poorly tracked, helping users recover outstanding loans and maintain financial awareness.

---

## Story 4.1: Loan Creation via Natural Language

**As a** user,  
**I want** to log a loan by typing "lent Ahmed 500",  
**so that** I can track money I've given to others.

### Acceptance Criteria

1. Convex `loans` table schema defined with fields: `userId`, `borrowerName`, `amount`, `currency`, `dateLent`, `status` (active/paid), `createdAt`
2. Bot detects loan creation intent from keywords like "lent", "loan", "أقرضت", "سلفت"
3. AI extracts borrower name and amount from user message
4. Bot presents extracted loan details for confirmation (e.g., "👤 Loan: 500 EGP to Ahmed. Confirm?")
5. On confirmation, loan saved to database with status='active'
6. Confirmation message sent (e.g., "✅ Loan recorded! Ahmed owes you 500 EGP")
7. Loan does not affect account balances (assumes cash already given)

---

## Story 4.2: List All Active Loans

**As a** user,  
**I want** to view all outstanding loans,  
**so that** I know who owes me money.

### Acceptance Criteria

1. Convex query `getUserLoans` retrieves all loans for a user, filtered by status
2. Bot responds to commands like "show loans", "list loans", "عرض القروض"
3. Response formatted as list with borrower name, amount, and date lent (e.g., "👤 Ahmed: 500 EGP (lent 2025-09-15)")
4. Total outstanding loan amount calculated and displayed
5. Empty state handled (e.g., "You don't have any active loans")
6. Loans sorted by date lent (oldest first)
7. Paid loans excluded from default view but accessible via "show all loans" command

---

## Story 4.3: Record Loan Payment

**As a** user,  
**I want** to log when someone repays part of a loan,  
**so that** I can track remaining balances accurately.

### Acceptance Criteria

1. Convex `loan_payments` table schema defined with fields: `loanId`, `amount`, `datePaid`, `createdAt`
2. Bot detects payment intent from messages like "Ahmed paid 200" or "أحمد دفع 200"
3. AI extracts borrower name and payment amount
4. Bot matches borrower name to active loans and confirms (e.g., "Ahmed paid 200 EGP toward 500 EGP loan?")
5. On confirmation, payment record created and linked to loan
6. Remaining loan balance calculated (original amount - sum of payments)
7. Confirmation message includes remaining balance (e.g., "✅ Payment recorded! Ahmed now owes 300 EGP")

---

## Story 4.4: Mark Loan as Fully Paid

**As a** user,  
**I want** loans to automatically close when fully repaid,  
**so that** my active loan list stays clean.

### Acceptance Criteria

1. After each payment, system calculates remaining balance (loan amount - total payments)
2. If remaining balance ≤ 0, loan status automatically updated to 'paid'
3. Confirmation message indicates loan closure (e.g., "✅ Loan fully repaid! Ahmed's loan is now closed.")
4. Paid loans excluded from active loan list but retained in database for history
5. User can manually mark loan as paid via command like "mark Ahmed loan as paid"
6. Manual closure requires confirmation to prevent accidental data loss
7. Overpayments handled gracefully (remaining balance shows as 0, not negative)

---

## Story 4.5: Loan Details & Payment History

**As a** user,  
**I want** to view detailed payment history for a specific loan,  
**so that** I can track repayment progress over time.

### Acceptance Criteria

1. Bot responds to commands like "show Ahmed loan details" or "تفاصيل قرض أحمد"
2. Response includes: borrower name, original amount, date lent, total paid, remaining balance
3. Payment history listed chronologically with dates and amounts
4. If no payments made, displays "No payments yet"
5. Response formatted clearly with emoji and markdown for readability
6. Works for both active and paid loans
7. If multiple loans exist for same borrower, bot asks for clarification or shows all

---

**Related Documents:**
- [Epic List](./epics.md)
- [Epic 3: Transactions](./epic-3-transactions.md)
- [Epic 5: History](./epic-5-history.md)
- [Requirements](./requirements.md)
