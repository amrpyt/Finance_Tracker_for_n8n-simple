# Coding Standards

**Version:** 1.0  
**Last Updated:** 2025-09-30

This document defines the coding standards for the Personal Finance Tracker Telegram Bot. These standards are **mandatory** for all development and will be enforced during code review.

---

## Critical Rules (MUST FOLLOW)

### 1. User Data Isolation

**Rule:** Every Convex query and mutation MUST filter by `userId` to prevent cross-user data access.

```typescript
// ✅ CORRECT
export const getUserAccounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("accounts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ❌ WRONG - Exposes all users' accounts
export const getAllAccounts = query({
  handler: async (ctx) => {
    return await ctx.db.query("accounts").collect();
  },
});
```

### 2. Type Safety in Convex Functions

**Rule:** All Convex function arguments MUST use strict validators. Never use `v.any()` except for AI responses.

```typescript
// ✅ CORRECT
export const createTransaction = mutation({
  args: {
    userId: v.id("users"),
    accountId: v.id("accounts"),
    amount: v.number(),
    description: v.string(),
    type: v.union(v.literal("expense"), v.literal("income")),
  },
  handler: async (ctx, args) => { /* ... */ },
});

// ❌ WRONG - No type safety
export const createTransaction = mutation({
  args: { data: v.any() },
  handler: async (ctx, args) => { /* ... */ },
});
```

### 3. Balance Consistency

**Rule:** Account balance updates MUST happen in the same transaction as creating/updating/deleting transaction records.

```typescript
// ✅ CORRECT - Atomic operation
export const createTransaction = mutation({
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    
    // Insert transaction
    const transactionId = await ctx.db.insert("transactions", {
      ...args,
      date: Date.now(),
      isDeleted: false,
      createdAt: Date.now(),
    });
    
    // Update balance in same transaction
    const balanceChange = args.type === "expense" ? -args.amount : args.amount;
    await ctx.db.patch(args.accountId, {
      balance: account.balance + balanceChange,
    });
    
    return { transactionId, newBalance: account.balance + balanceChange };
  },
});

// ❌ WRONG - Separate operations can fail independently
export const createTransaction = mutation({
  handler: async (ctx, args) => {
    await ctx.db.insert("transactions", args);
    // Balance update in separate function - can fail!
  },
});
```

### 4. Soft Deletes

**Rule:** Never physically delete transactions or loans. Use `isDeleted` flag for audit trail.

```typescript
// ✅ CORRECT
export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });
  },
});

// ❌ WRONG - Permanent data loss
export const deleteTransaction = mutation({
  args: { transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.transactionId);
  },
});
```

### 5. AI Confirmation Pattern

**Rule:** Always present AI-extracted data to user for confirmation before committing to database.

```typescript
// ✅ CORRECT - Two-step flow
async function handleExpenseMessage(bot, msg, userId, message) {
  // Step 1: Extract with AI
  const extracted = await convex.action(api.ai.extractTransaction, { message });
  
  // Step 2: Present for confirmation
  await bot.sendMessage(
    msg.chat.id,
    `💸 Expense: ${extracted.amount} EGP for '${extracted.description}'. Confirm?`
  );
  
  // Step 3: Wait for user confirmation before saving
  sessionManager.setPendingConfirmation(userId, { type: "expense", data: extracted });
}

// ❌ WRONG - Auto-saves without confirmation
async function handleExpenseMessage(bot, msg, userId, message) {
  const extracted = await convex.action(api.ai.extractTransaction, { message });
  await convex.mutation(api.transactions.create, extracted); // No confirmation!
}
```

### 6. Error Messages in User's Language

**Rule:** All user-facing error messages MUST be provided in both Arabic and English based on user's language preference.

```typescript
// ✅ CORRECT
export class AppError extends Error {
  constructor(
    public code: string,
    public userMessage: { en: string; ar: string }
  ) {
    super(userMessage.en);
  }
}

export function throwInvalidAmount() {
  throw new AppError("INVALID_AMOUNT", {
    en: "Amount must be a positive number",
    ar: "يجب أن يكون المبلغ رقماً موجباً",
  });
}

// ❌ WRONG - English only
export function throwInvalidAmount() {
  throw new Error("Amount must be a positive number");
}
```

### 7. Input Validation

**Rule:** Validate all user inputs before processing. Never trust client data.

```typescript
// ✅ CORRECT
export const createAccount = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.union(v.literal("bank"), v.literal("cash"), v.literal("credit")),
    initialBalance: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate name length
    if (args.name.length < 1 || args.name.length > 50) {
      throw new AppError("INVALID_NAME", {
        en: "Account name must be 1-50 characters",
        ar: "يجب أن يكون اسم الحساب من 1-50 حرفاً",
      });
    }
    
    // Validate balance is not negative for bank/cash
    if (args.type !== "credit" && args.initialBalance < 0) {
      throw new AppError("INVALID_BALANCE", {
        en: "Initial balance cannot be negative",
        ar: "لا يمكن أن يكون الرصيد الأولي سالباً",
      });
    }
    
    // Proceed with creation
  },
});
```

### 8. Rate Limiting

**Rule:** Implement rate limiting to prevent spam and abuse.

```typescript
// ✅ CORRECT - Bot server rate limiting
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = rateLimiter.get(userId);
  
  if (!limit || now > limit.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + 60000 }); // 1 minute
    return true;
  }
  
  if (limit.count >= 10) {
    return false; // Exceeded 10 messages/minute
  }
  
  limit.count++;
  return true;
}

bot.on("message", async (msg) => {
  if (!checkRateLimit(msg.from!.id.toString())) {
    await bot.sendMessage(msg.chat.id, "Too many requests. Please wait a moment.");
    return;
  }
  // Process message
});
```

---

## Naming Conventions

### Convex Functions

```typescript
// Queries: get*, list*, search*
export const getUserAccounts = query({ /* ... */ });
export const listTransactions = query({ /* ... */ });
export const searchTransactions = query({ /* ... */ });

// Mutations: create*, update*, delete*, set*
export const createAccount = mutation({ /* ... */ });
export const updateTransaction = mutation({ /* ... */ });
export const deleteTransaction = mutation({ /* ... */ });
export const setDefaultAccount = mutation({ /* ... */ });

// Actions: process*, call*, fetch*
export const processUserMessage = action({ /* ... */ });
export const callRorkAPI = action({ /* ... */ });
```

### Database Tables

```typescript
// Use snake_case plural nouns
defineTable("users")
defineTable("accounts")
defineTable("transactions")
defineTable("loans")
defineTable("loan_payments")
```

### TypeScript Interfaces

```typescript
// Use PascalCase
export interface User { /* ... */ }
export interface Account { /* ... */ }
export interface Transaction { /* ... */ }
export interface LoanPayment { /* ... */ }
```

### Bot Handlers

```typescript
// Use camelCase with 'handle' prefix
function handleStartCommand(bot, msg) { /* ... */ }
function handleExpenseIntent(bot, msg, result) { /* ... */ }
function handleConfirmation(bot, msg, session) { /* ... */ }
```

### Environment Variables

```bash
# Use UPPER_SNAKE_CASE
TELEGRAM_BOT_TOKEN=xxx
RORK_API_KEY=xxx
CONVEX_URL=xxx
LOG_LEVEL=info
```

### File Names

```
# Code files: camelCase
transactions.ts
userService.ts
rorkClient.ts

# Config files: kebab-case
config.api.json
tsconfig.json
package.json
```

---

## Code Organization

### Convex Function File Structure

```typescript
// convex/transactions.ts

// 1. Imports
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { AppError } from "./lib/errors";

// 2. Queries (read operations)
export const getRecentTransactions = query({ /* ... */ });
export const getTransactionsByDateRange = query({ /* ... */ });
export const searchTransactions = query({ /* ... */ });

// 3. Mutations (write operations)
export const createTransaction = mutation({ /* ... */ });
export const updateTransaction = mutation({ /* ... */ });
export const deleteTransaction = mutation({ /* ... */ });

// 4. Helper functions (not exported)
async function calculateNewBalance(ctx, accountId, amount, type) {
  // Internal helper
}
```

### Bot Handler File Structure

```typescript
// bot/src/handlers/messages.ts

// 1. Imports
import TelegramBot from "node-telegram-bot-api";
import { convexClient } from "../services/convex";
import { sessionManager } from "../services/session";

// 2. Main handler setup
export function setupMessageHandlers(bot: TelegramBot) {
  bot.on("message", handleMessage);
}

// 3. Handler functions
async function handleMessage(msg: TelegramBot.Message) { /* ... */ }
async function handleExpenseIntent(bot, msg, userId, result) { /* ... */ }
async function handleConfirmation(bot, msg, session) { /* ... */ }

// 4. Helper functions
function formatTransactionMessage(transaction) { /* ... */ }
```

---

## TypeScript Best Practices

### Use Strict Mode

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Avoid `any` Type

```typescript
// ✅ CORRECT
function processTransaction(transaction: Transaction): void { /* ... */ }

// ❌ WRONG
function processTransaction(transaction: any): void { /* ... */ }

// Exception: AI responses (unknown structure)
const aiResponse: any = await callRorkAPI(message);
```

### Use Type Guards

```typescript
// ✅ CORRECT
function isExpense(transaction: Transaction): transaction is Transaction & { type: "expense" } {
  return transaction.type === "expense";
}

if (isExpense(transaction)) {
  // TypeScript knows transaction.type is "expense"
}
```

### Prefer Interfaces Over Types for Objects

```typescript
// ✅ CORRECT
export interface User {
  _id: Id<"users">;
  telegramUserId: string;
  firstName: string;
}

// ❌ LESS PREFERRED (use for unions/primitives)
export type User = {
  _id: Id<"users">;
  telegramUserId: string;
  firstName: string;
};
```

---

## Error Handling Patterns

### Convex Functions

```typescript
export const createTransaction = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => {
    try {
      // Validate inputs
      if (args.amount <= 0) {
        throw new AppError("INVALID_AMOUNT", {
          en: "Amount must be positive",
          ar: "يجب أن يكون المبلغ موجباً",
        });
      }
      
      // Business logic
      const result = await performOperation(ctx, args);
      
      return { success: true, data: result };
    } catch (error) {
      // Let AppError bubble up
      if (error instanceof AppError) {
        throw error;
      }
      
      // Log unexpected errors
      console.error("Unexpected error in createTransaction:", error);
      throw new AppError("INTERNAL_ERROR", {
        en: "An unexpected error occurred",
        ar: "حدث خطأ غير متوقع",
      });
    }
  },
});
```

### Bot Handlers

```typescript
async function handleMessage(msg: TelegramBot.Message) {
  try {
    // Process message
    const result = await convexClient.action(api.ai.processUserMessage, {
      userId,
      message: msg.text,
    });
    
    // Handle result
    await handleIntent(bot, msg, result);
  } catch (error) {
    logger.error("Error processing message:", { error, userId: msg.from?.id });
    
    // Get user language
    const language = await getUserLanguage(msg.from!.id);
    
    // Send user-friendly error
    const errorMessage = handleError(error, language);
    await bot.sendMessage(msg.chat.id, errorMessage);
  }
}
```

---

## Logging Standards

### What to Log

```typescript
// ✅ DO LOG
logger.info("User created", { userId, telegramUserId });
logger.info("Transaction created", { userId, transactionId, amount });
logger.error("AI API call failed", { userId, error, retryCount });
logger.warn("Rate limit exceeded", { userId, requestCount });

// ❌ DON'T LOG
logger.info("Processing message"); // Too vague
logger.info(JSON.stringify(entireUserObject)); // Too much data
logger.info("User password: xxx"); // Sensitive data
```

### Log Format

```typescript
// Use structured logging (JSON)
logger.info("Event description", {
  userId: "user123",
  action: "create_transaction",
  amount: 50,
  timestamp: Date.now(),
});

// NOT unstructured strings
logger.info(`User user123 created transaction for 50 EGP`);
```

### Log Levels

- **error:** Failures that require investigation
- **warn:** Unexpected but handled situations (rate limits, validation failures)
- **info:** Important business events (user creation, transactions)
- **debug:** Detailed debugging information (only in development)

---

## Testing Standards

### Unit Test Structure

```typescript
// Use describe/it pattern
describe("createTransaction", () => {
  it("should create expense and decrease balance", async () => {
    // Arrange
    const userId = await createTestUser();
    const accountId = await createTestAccount(userId, 1000);
    
    // Act
    const result = await t.mutation(createTransaction, {
      userId,
      accountId,
      type: "expense",
      amount: 50,
      description: "coffee",
      category: "Food",
    });
    
    // Assert
    expect(result.newBalance).toBe(950);
  });
  
  it("should throw error for negative amount", async () => {
    await expect(
      t.mutation(createTransaction, { amount: -50, /* ... */ })
    ).rejects.toThrow("Amount must be positive");
  });
});
```

### Test Coverage Requirements

- **Convex Functions:** 80%+ coverage for business logic
- **Bot Handlers:** 60%+ coverage (integration tests preferred)
- **Utilities:** 90%+ coverage

---

## Security Standards

### Never Commit Secrets

```bash
# ✅ CORRECT - Use environment variables
TELEGRAM_BOT_TOKEN=xxx
RORK_API_KEY=xxx

# ❌ WRONG - Hardcoded in code
const BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";
```

### Sanitize User Inputs

```typescript
// ✅ CORRECT
function sanitizeDescription(description: string): string {
  return description
    .trim()
    .slice(0, 200) // Max length
    .replace(/[<>]/g, ""); // Remove HTML-like characters
}

export const createTransaction = mutation({
  handler: async (ctx, args) => {
    const sanitized = sanitizeDescription(args.description);
    // Use sanitized value
  },
});
```

### Validate User Ownership

```typescript
// ✅ CORRECT - Always verify ownership
export const updateTransaction = mutation({
  args: { userId: v.id("users"), transactionId: v.id("transactions") },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    
    if (!transaction || transaction.userId !== args.userId) {
      throw new AppError("UNAUTHORIZED", {
        en: "You cannot modify this transaction",
        ar: "لا يمكنك تعديل هذه المعاملة",
      });
    }
    
    // Proceed with update
  },
});
```

---

## Performance Standards

### Database Query Optimization

```typescript
// ✅ CORRECT - Use indexes
export const getRecentTransactions = query({
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_user_not_deleted", (q) =>
        q.eq("userId", args.userId).eq("isDeleted", false)
      )
      .order("desc")
      .take(20);
  },
});

// ❌ WRONG - Full table scan
export const getRecentTransactions = query({
  handler: async (ctx, args) => {
    const all = await ctx.db.query("transactions").collect();
    return all.filter(t => t.userId === args.userId && !t.isDeleted);
  },
});
```

### Avoid N+1 Queries

```typescript
// ✅ CORRECT - Batch fetch
export const getTransactionsWithAccounts = query({
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(20);
    
    // Fetch all accounts in one query
    const accountIds = [...new Set(transactions.map(t => t.accountId))];
    const accounts = await Promise.all(
      accountIds.map(id => ctx.db.get(id))
    );
    
    // Map accounts to transactions
    const accountMap = new Map(accounts.map(a => [a._id, a]));
    return transactions.map(t => ({
      ...t,
      account: accountMap.get(t.accountId),
    }));
  },
});

// ❌ WRONG - N+1 queries
export const getTransactionsWithAccounts = query({
  handler: async (ctx, args) => {
    const transactions = await ctx.db.query("transactions").take(20);
    
    // Fetches account for each transaction separately!
    return await Promise.all(
      transactions.map(async t => ({
        ...t,
        account: await ctx.db.get(t.accountId),
      }))
    );
  },
});
```

---

## Documentation Standards

### Function Documentation

```typescript
/**
 * Creates a new transaction and updates the account balance atomically.
 * 
 * @param userId - ID of the user creating the transaction
 * @param accountId - ID of the account to debit/credit
 * @param type - "expense" or "income"
 * @param amount - Transaction amount (must be positive)
 * @param description - Transaction description (max 200 chars)
 * @param category - Transaction category (from predefined list)
 * 
 * @returns Transaction ID and updated account balance
 * @throws AppError if amount is invalid or account not found
 */
export const createTransaction = mutation({
  args: { /* ... */ },
  handler: async (ctx, args) => { /* ... */ },
});
```

### Code Comments

```typescript
// ✅ GOOD COMMENTS - Explain WHY
// Calculate remaining balance by subtracting total payments from original loan amount
// This handles partial payments and overpayments (capped at 0)
const remaining = Math.max(0, loan.amount - totalPayments);

// ❌ BAD COMMENTS - Explain WHAT (obvious from code)
// Add 1 to counter
counter = counter + 1;
```

---

**Document Owner:** Architect  
**Enforcement:** Code review required for all PRs  
**Review Frequency:** Updated as new patterns emerge
