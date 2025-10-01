# Convex Backend

This directory contains the Convex serverless backend for the Personal Finance Tracker.

## Structure

- `schema.ts` - Database schema definition
- `users.ts` - User management functions
- `accounts.ts` - Account CRUD operations
- `lib/` - Shared utilities
  - `errors.ts` - Error handling with bilingual messages
  - `validation.ts` - Input validation utilities
- `_generated/` - Auto-generated Convex types (gitignored)

## Database Schema

### Tables

#### users
Stores user profiles linked to Telegram accounts.

```typescript
{
  _id: Id<"users">,
  telegramUserId: string,           // Telegram user ID (unique)
  username: string | undefined,     // Telegram username (optional)
  firstName: string,                // User's first name
  languagePreference: string,       // "ar" or "en"
  createdAt: number                 // Timestamp
}
```

**Indexes:**
- `by_telegram_id` on `["telegramUserId"]`

#### accounts
Stores user financial accounts (bank, cash, credit).

```typescript
{
  _id: Id<"accounts">,
  userId: Id<"users">,              // Reference to users table
  name: string,                     // Account name (1-50 chars)
  type: "bank" | "cash" | "credit", // Account type
  balance: number,                  // Current balance
  currency: string,                 // Currency code (default: "EGP")
  createdAt: number                 // Timestamp
}
```

**Indexes:**
- `by_user` on `["userId", "_creationTime"]`

**Validation Rules:**
- Account name: 1-50 characters
- Balance: Cannot be negative for bank/cash accounts (credit allows negative)
- Type: Must be exactly "bank", "cash", or "credit"

## Functions

### Queries

#### users.getUserByTelegramId
Get user by Telegram ID.

```typescript
args: { telegramUserId: string }
returns: User | null
```

#### accounts.getUserAccounts
Get all accounts for a user.

```typescript
args: { userId: Id<"users"> }
returns: Account[]
```

### Mutations

#### users.createOrGetUser
Create new user or return existing user.

```typescript
args: {
  telegramUserId: string,
  username?: string,
  firstName: string,
  languageCode?: string
}
returns: { user: User, isNewUser: boolean }
```

#### accounts.createAccount
Create a new account for a user.

```typescript
args: {
  userId: Id<"users">,
  name: string,
  type: "bank" | "cash" | "credit",
  initialBalance: number
}
returns: {
  accountId: Id<"accounts">,
  name: string,
  type: string,
  balance: number,
  currency: string
}
```

**Throws:**
- `INVALID_NAME` - Name is empty or > 50 characters
- `INVALID_BALANCE` - Negative balance for bank/cash account
- `INVALID_TYPE` - Invalid account type
- `INTERNAL_ERROR` - Unexpected server error

## Development

```bash
# Install dependencies
npm install

# Start development server (watches for changes)
npx convex dev

# Deploy to production
npx convex deploy

# Run tests
npm test
```

## Error Handling

All errors use the `AppError` class with bilingual messages:

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public userMessage: { en: string; ar: string }
  )
}
```

**Error Codes:**
- `INVALID_NAME` - Invalid account/entity name
- `INVALID_BALANCE` - Invalid balance value
- `INVALID_TYPE` - Invalid type value
- `INVALID_AMOUNT` - Invalid amount value
- `INTERNAL_ERROR` - Unexpected server error
- `UNAUTHORIZED` - Unauthorized access attempt

## Validation

Input validation is handled in `lib/validation.ts`:

- `validateAccountName(name)` - Validates 1-50 character length
- `validateBalance(balance, type)` - Validates balance based on account type
- `sanitizeAccountName(name)` - Removes dangerous characters

## Best Practices

### Security
- Always filter queries by `userId` to prevent cross-user data access
- Use indexes for all user-specific queries
- Validate all inputs before processing
- Never expose other users' data

### Type Safety
- Use strict validators (`v.union(v.literal(...))` instead of `v.string()`)
- Never use `v.any()` except for AI responses
- Define explicit return types for all functions

### Performance
- Use database indexes for all queries
- Avoid N+1 queries
- Keep functions focused and small

### Error Messages
- All user-facing errors must be bilingual (English/Arabic)
- Use AppError class for consistent error handling
- Provide actionable error messages

## Testing

Tests use Vitest with convex-test. Target coverage: 80%+ for business logic.

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## Deployment

### Development
```bash
npx convex dev
```

### Production
```bash
npx convex deploy
```

### Environment Variables

Set in Convex Dashboard under Settings → Environment Variables:

- `RORK_API_KEY` - API key for Rork Toolkit (AI features)

## API Documentation

See [docs/api/](../docs/api/) for detailed API documentation:

- [Users API](../docs/api/users-api.md)
- [Accounts API](../docs/api/accounts-api.md)

## Troubleshooting

### Schema Changes Not Applying

```bash
# Clear and redeploy
npx convex dev --once
```

### Type Errors

Convex requires `.js` extensions in imports even for TypeScript files:

```typescript
// ✅ Correct
import { AppError } from "./lib/errors.js";

// ❌ Wrong
import { AppError } from "./lib/errors";
```

### Function Not Found

- Ensure function is exported
- Check function name matches exactly
- Redeploy with `npx convex deploy`

---

**Last Updated:** 2025-10-02
