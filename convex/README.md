# Convex Backend

This directory contains the Convex serverless backend for the Personal Finance Tracker Telegram Bot.

## Structure

- `schema.ts` - Database schema definition
- `system.ts` - System health check and status queries
- `users.ts` - User management functions (future)
- `accounts.ts` - Account CRUD operations (future)
- `transactions.ts` - Transaction management (future)
- `loans.ts` - Loan tracking functions (future)
- `ai.ts` - AI integration actions (future)
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

### Testing in Convex Dashboard

To test the health check function in the Convex Dashboard:

1. Deploy functions: `npx convex dev` (or `npx convex deploy` for production)
2. Navigate to [Convex Dashboard](https://dashboard.convex.dev)
3. Select your project
4. Go to **Functions** tab
5. Find and click `system:getSystemStatus`
6. Click **Run** (no arguments needed)
7. Verify response contains:
   - `status: "healthy"`
   - `timestamp: <current_timestamp>`
   - `version: "1.0.0"`
   - `message: "Convex backend is operational"`
8. Check **Logs** tab to verify function execution was logged

Expected response format:
```json
{
  "status": "healthy",
  "timestamp": 1696176000000,
  "version": "1.0.0",
  "message": "Convex backend is operational"
}
```
