# Convex Backend

This directory contains the Convex serverless backend for the Personal Finance Tracker Telegram Bot.

## Structure

- `schema.ts` - Database schema definition
- `users.ts` - User management functions
- `accounts.ts` - Account CRUD operations
- `transactions.ts` - Transaction management
- `loans.ts` - Loan tracking functions
- `ai.ts` - AI integration actions
- `lib/` - Shared backend utilities
- `prompts/` - AI system prompts
- `tests/` - Convex function tests

## Development

```bash
# Start Convex development server
npm run dev

# Run tests
npm test
```

## Convex Functions

- **Queries:** Read operations (get*, list*, search*)
- **Mutations:** Write operations (create*, update*, delete*)
- **Actions:** External API calls (process*, call*, fetch*)

## Testing

Tests use Vitest and Convex Test for function testing. All business logic must have 80%+ test coverage.
