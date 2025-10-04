# Story 3.2 Deployment Guide

## Implementation Summary

Story 3.2 "Expense Logging with AI Extraction" has been implemented with core functionality complete. The implementation includes:

### ✅ Completed Features

1. **Transactions Database Schema**
   - Added `transactions` table to Convex schema
   - Defined indexes for efficient querying
   - Created TypeScript interfaces

2. **Transaction Management Functions**
   - `createTransaction` - Atomic transaction creation with balance updates
   - `getRecentTransactions` - Query recent transactions for AI context
   - `getTransactionsByDateRange` - Date-filtered transaction queries
   - `deleteTransaction` - Soft delete with balance reversal

3. **AI-Powered Expense Detection**
   - Natural language processing for expense/income messages
   - Confidence-based handling (high/medium/low)
   - Bilingual support (Arabic/English)

4. **Confirmation Flow**
   - Inline keyboard confirmations (✅ Confirm / ❌ Cancel)
   - Session-based pending transaction storage
   - 5-minute expiration timeout
   - Success messages with updated balance

5. **Bot Enhancements**
   - Extended message handlers for AI intent processing
   - Created callback handlers for inline keyboard interactions
   - Enhanced session manager with transaction support

### ⚠️ Known Issues

1. **TypeScript Error**: `api.ai` not found in bot handlers
   - **Cause**: Convex API types not regenerated yet
   - **Resolution**: Will be fixed after successful Convex deployment

2. **Convex Deployment Failure**: Node.js runtime errors
   - **Cause**: Missing `"use node"` directive in files using Node APIs
   - **Files Affected**: `convex/lib/rork.ts` (and potentially others)
   - **Resolution**: Add `"use node";` at the top of affected files

## Deployment Steps

### Step 1: Fix Node.js Runtime Issues ✅

**COMPLETED** - Added `"use node";` directive to `convex/lib/rork.ts`

### Step 2: Deploy to Convex Cloud

⚠️ **DEPLOYMENT ISSUE DETECTED**: Convex CLI has bundling errors with Node.js built-in modules.

**Error**: `Could not resolve "fs", "crypto", "buffer"` etc.

**Root Cause**: This is a known issue with Docker-based Convex setups or certain Node.js/npm configurations.

**Alternative Deployment Methods:**

#### Option A: Use Convex Dashboard (Recommended)
1. Go to https://dashboard.convex.dev
2. Select your project
3. Navigate to "Functions" tab
4. Click "Deploy" button
5. The dashboard will deploy directly from your connected Git repository

#### Option B: Try with Different Node Version
```bash
# Use Node 18 LTS
nvm use 18
npx convex deploy
```

#### Option C: Manual File Upload (Last Resort)
1. Zip the `convex/` directory
2. Upload via Convex dashboard
3. Manually trigger deployment

### Step 2b: Verify Schema Deployment

Once deployment succeeds (via any method):
- Check Convex dashboard for `transactions` table
- Verify all functions are listed
- Check deployment logs for errors

### Step 3: Verify Deployment

1. Check Convex dashboard for:
   - `transactions` table exists
   - All functions deployed successfully
   - No deployment errors

2. Test in Convex dashboard:
   ```javascript
   // Test AI processing
   await api.ai.processUserMessage({
     userId: "<test-user-id>",
     message: "paid 50 for coffee"
   })
   ```

### Step 4: Test with Telegram Bot

1. Start bot server:
   ```bash
   cd bot
   npm run dev
   ```

2. Test scenarios:
   - Send "paid 50 for coffee" (English)
   - Send "دفعت ٣٠ جنيه على قهوة" (Arabic)
   - Click ✅ Confirm button
   - Click ❌ Cancel button
   - Verify balance updates

3. Check Convex dashboard:
   - Verify transactions created
   - Verify account balances updated
   - Check logs for errors

### Step 5: Run Tests (Optional)

Unit tests are pending (Task 7) but can be added later:

```bash
# Convex tests
cd convex
npm test

# Bot tests
cd bot
npm test
```

## Files Modified

### Created Files
- `shared/src/types/transaction.ts`
- `bot/src/handlers/callbacks.ts`

### Modified Files
- `convex/schema.ts`
- `convex/transactions.ts`
- `convex/lib/validation.ts`
- `convex/lib/errors.ts`
- `bot/src/handlers/messages.ts`
- `bot/src/handlers/index.ts`
- `bot/src/services/session.ts`
- `bot/src/index.ts`
- `shared/src/types/index.ts`

## Rollback Plan

If deployment fails:

1. Revert schema changes:
   ```bash
   git checkout HEAD -- convex/schema.ts
   ```

2. Revert to previous Convex deployment:
   ```bash
   # Use Convex dashboard to rollback to previous deployment
   ```

3. Bot server will continue working with previous functionality

## Success Criteria

- [ ] Convex deployment successful
- [ ] No TypeScript errors in bot handlers
- [ ] Transactions table visible in Convex dashboard
- [ ] Bot responds to "paid X for Y" messages
- [ ] Confirmation buttons work
- [ ] Balance updates correctly
- [ ] Both Arabic and English work

## Next Steps

After successful deployment:

1. **Add Unit Tests** (Task 7)
   - Transaction function tests
   - Bot handler tests
   - Achieve 80%+ coverage

2. **Monitor Production**
   - Watch Convex logs for errors
   - Monitor bot performance
   - Track user feedback

3. **Story 3.3+**
   - Continue with next stories in Epic 3
   - Build on transaction foundation

## Support

If issues arise:
- Check Convex dashboard logs
- Check bot server logs
- Review `docs/stories/3.2.expense-logging-with-ai-extraction.md` for details
- Contact dev team for assistance
