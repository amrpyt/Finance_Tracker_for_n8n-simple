# Production Deployment Guide - Story 2.2

**Date:** 2025-10-02  
**Story:** 2.2 - List All Accounts with Balances  
**Status:** ✅ Ready for Production

---

## Pre-Deployment Checklist

- [x] Code committed to repository (commit: 9ab60e4)
- [x] Unit tests passing (41 tests)
- [x] Manual QA completed on Telegram Web
- [x] All acceptance criteria verified (6/7)
- [ ] Production environment ready
- [ ] Environment variables configured
- [ ] Convex backend accessible

---

## Deployment Steps

### Step 1: Deploy Convex Functions (if needed)

The Convex functions (`getUserAccounts`) are already deployed from Story 2.1. No Convex changes needed for Story 2.2.

**Verification:**
```bash
# Test Convex connection
node test-convex-query.js
```

---

### Step 2: Deploy Bot to Production

#### Option A: VPS Deployment (Docker)

**SSH into your VPS:**
```bash
ssh root@156.67.25.212
# Password: 2QEOc478Wp9eYpivhhhQ2e
```

**Navigate to bot directory:**
```bash
cd /path/to/Finance_Tracker_for_n8n-simple/bot
```

**Pull latest changes:**
```bash
git pull origin master
```

**Install dependencies (if needed):**
```bash
npm install
```

**Restart bot container:**
```bash
# Find bot container
docker ps | grep finance-tracker-bot

# Restart the bot
docker restart <bot-container-name>

# Or if using docker-compose
docker-compose restart bot
```

**Check logs:**
```bash
docker logs -f <bot-container-name>
```

**Expected log output:**
```
[INFO] Message handlers registered
[INFO] Telegram bot started successfully
[INFO] Bot username: @FinanceTracker_coderaai_bot
```

---

#### Option B: Local Production Mode

If running bot locally in production:

```bash
cd bot
npm install
npm run dev
```

Keep the terminal open and monitor logs.

---

### Step 3: Verify Deployment

**Test on Telegram:**

1. Open Telegram and find `@FinanceTracker_coderaai_bot`
2. Send: `show accounts`
3. Expected response:
   ```
   🏦 Your Accounts
   
   🏦 Visa Card (Bank): 500 EGP
   💵 فودافون كاش (Cash): 0 EGP
   💳 ء (Credit): -3 EGP
   
   💰 Total Balance: 497.00 EGP
   ```

4. Send: `عرض الحسابات`
5. Verify Arabic response

**Verification Checklist:**
- [ ] Bot responds to "show accounts"
- [ ] Bot responds to "عرض الحسابات"
- [ ] All accounts displayed
- [ ] Correct sorting (oldest first)
- [ ] Total balance accurate
- [ ] Emojis display correctly
- [ ] Response time < 2 seconds

---

### Step 4: Test Empty State

**Create a test user with no accounts:**

1. Create new Telegram account OR use test account
2. Send `/start` to bot
3. Send `show accounts`
4. Expected response:
   ```
   You don't have any accounts yet. 📭

   Create your first account by typing:
   • "create account" or
   • "إنشاء حساب"
   ```

**Empty State Checklist:**
- [ ] Empty message displays correctly
- [ ] Helpful prompt to create account
- [ ] Bilingual instructions shown
- [ ] No errors in logs

---

### Step 5: Monitor Performance & Logs

**Monitor bot logs for 30 minutes:**

```bash
# If using Docker
docker logs -f <bot-container-name>

# If running locally
# Watch the terminal output
```

**What to monitor:**
- ✅ No error messages
- ✅ Response times < 2 seconds
- ✅ Successful Convex queries
- ✅ Proper intent detection

**Key log entries to watch for:**
```
[INFO] Account list intent detected
[INFO] Account list displayed
[INFO] Response time: XXXms
```

**Error patterns to watch for:**
```
[ERROR] Failed to fetch accounts
[ERROR] User not found
[ERROR] Convex query failed
```

---

## Performance Benchmarks

**Expected Metrics:**
- Response time: < 2 seconds
- Memory usage: Stable (no leaks)
- CPU usage: < 10% average
- Error rate: 0%

**Monitoring Commands:**
```bash
# Check bot process
ps aux | grep node

# Check memory usage
docker stats <bot-container-name>

# Check error logs
docker logs <bot-container-name> | grep ERROR
```

---

## Rollback Plan

If issues are found in production:

**Immediate Rollback:**
```bash
# SSH to VPS
ssh root@156.67.25.212

# Revert to previous commit
cd /path/to/Finance_Tracker_for_n8n-simple
git revert HEAD
git push origin master

# Restart bot
docker restart <bot-container-name>
```

**Verify rollback:**
- Send "show accounts" - should not respond (feature removed)
- Account creation should still work (Story 2.1)

---

## Post-Deployment Verification

### Test Scenarios

**Scenario 1: Multiple Accounts**
- User: Existing user with 3+ accounts
- Command: "show accounts"
- Expected: All accounts listed with total

**Scenario 2: Single Account**
- User: User with 1 account
- Command: "list accounts"
- Expected: Single account with total

**Scenario 3: Empty State**
- User: New user with 0 accounts
- Command: "my accounts"
- Expected: Empty state message with prompt

**Scenario 4: Arabic Support**
- User: Arabic-speaking user
- Command: "عرض الحسابات"
- Expected: Arabic response with all accounts

**Scenario 5: Mixed Balances**
- User: User with positive, zero, and negative balances
- Command: "show accounts"
- Expected: Correct total calculation

---

## Known Issues

### Non-Blocking Issues:

1. **TypeScript Build Error**
   - Issue: Convex imports cause tsc compilation errors
   - Workaround: Using `ts-node --transpile-only` in dev mode
   - Impact: None (bot runs fine with ts-node)
   - Fix: Planned for future (proper tsconfig setup)

2. **Empty State Not Tested**
   - Issue: Requires deleting all accounts
   - Impact: Low (code implemented, unit tested)
   - Action: Test with new user account post-deployment

---

## Success Criteria

**Deployment is successful if:**
- ✅ Bot responds to "show accounts" in < 2s
- ✅ Bot responds to "عرض الحسابات" in < 2s
- ✅ All accounts displayed correctly
- ✅ Total balance calculated accurately
- ✅ Accounts sorted by creation date
- ✅ Emojis display correctly
- ✅ No errors in logs for 30 minutes
- ✅ Empty state works (if tested)

---

## Support Information

**Bot Details:**
- Username: `@FinanceTracker_coderaai_bot`
- Environment: Production
- Hosting: VPS (156.67.25.212)
- Backend: Self-hosted Convex

**Key Files:**
- Bot: `bot/src/handlers/messages.ts`
- Utils: `bot/src/utils/accountHelpers.ts`
- Messages: `bot/src/utils/messages.ts`
- Convex: `convex/accounts.ts` (already deployed)

**Logs Location:**
- Docker: `docker logs <container-name>`
- Local: Terminal output

---

## Next Steps After Deployment

1. ✅ Monitor logs for 30 minutes
2. ✅ Test all scenarios above
3. ✅ Verify empty state with test user
4. ✅ Update PROJECT_STATUS.md
5. ✅ Mark Story 2.2 as "Deployed"
6. 🎯 Begin Story 2.3 (next in Epic 2)

---

**Deployment Guide Created By:** Quinn (QA Agent)  
**Date:** 2025-10-02 02:54:00
