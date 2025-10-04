# Manual Test Execution Guide - Story 7.1

**Date:** 2025-10-04  
**Tester:** [Your Name]  
**Deployment:** https://ceaseless-cardinal-528.convex.cloud  
**Status:** Ready for Testing

---

## Prerequisites

Before starting tests, ensure:
- ✅ Convex deployment successful (https://ceaseless-cardinal-528.convex.cloud)
- ✅ TELEGRAM_BOT_TOKEN configured in Convex dashboard
- ✅ Telegram webhook URL set to Convex HTTP action endpoint
- ✅ Test Telegram account ready

---

## Test Environment Setup

### Step 1: Verify Convex Deployment

1. Open Convex Dashboard: https://dashboard.convex.dev
2. Navigate to your project: `ceaseless-cardinal-528`
3. Check **Functions** tab - should see:
   - ✅ `telegram:webhookHandler` (HTTP Action)
   - ✅ `messageProcessor:processMessage` (Action)
   - ✅ `expenseActions:addExpense` (Internal Action)
   - ✅ `balanceActions:checkBalance` (Internal Action)
   - ✅ `chartGenerator:generateChart` (Internal Action)
   - ✅ `telegramAPI:sendMessage` (Internal Action)
   - ✅ `rorkIntegration:processText` (Internal Action)
   - ✅ `userProfiles:getUserProfile` (Internal Query)
   - ✅ `transactions:createTransaction` (Internal Mutation)
   - ✅ `accounts:getUserDefaultAccount` (Internal Query)

### Step 2: Verify Environment Variables

In Convex Dashboard → Settings → Environment Variables:
- ✅ `TELEGRAM_BOT_TOKEN` = [Your bot token]

### Step 3: Set Telegram Webhook

Run this command (replace with your bot token):
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://ceaseless-cardinal-528.convex.cloud/telegram/webhookHandler"}'
```

Expected response:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

---

## Priority 1 Test Scenarios (CRITICAL)

### ✅ Test 1: Basic Bot Startup

**Objective:** Verify bot responds to /start command

**Steps:**
1. Open Telegram
2. Find your bot: `@FinanceTracker_coderaai_bot`
3. Send: `/start`

**Expected Result:**
```
Hello [Your Name]! 👋

I'm your personal finance assistant. I can help you:
• Track expenses and income
• Check account balances
• Generate expense charts
• Manage your accounts

[English] [العربية] (buttons)
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

**Screenshots:** ___________________________

**Logs to Check:**
- Convex Dashboard → Logs → Filter: `messageProcessor`
- Look for: `[messageProcessor] Processing update`
- Verify: No errors, successful completion

---

### ✅ Test 2: Language Selection

**Objective:** Verify language switching works

**Steps:**
1. Click "English" button from /start message
2. Verify confirmation message

**Expected Result:**
```
✅ Language changed to English
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

**Convex Logs to Check:**
- Look for: `[messageProcessor] Handling callback`
- Verify: `internal.userProfiles.updateUserLanguage` called
- Check: No errors

---

### ✅ Test 3: Help Command

**Objective:** Verify /help command works

**Steps:**
1. Send: `/help`

**Expected Result:**
```
📖 Help & Commands

🔹 Commands:
/start - Get started
/balance - Check balance
/chart - Generate chart
/help - Show help

💬 You can also:
• "I spent 50 on coffee"
• "What's my balance?"
• "Show me a chart"
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

### ✅ Test 4: Natural Language Expense (CRITICAL)

**Objective:** Verify AI-powered expense logging

**Steps:**
1. Send: `I spent 50 on coffee`
2. Wait for response

**Expected Result:**
```
✅ Expense logged!
💸 50 EGP - coffee
💰 New balance: [amount] EGP
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

**Critical Checks:**
- ✅ RORK AI called successfully (or fallback to keywords)
- ✅ Amount extracted: 50
- ✅ Description extracted: coffee
- ✅ Category assigned: Food
- ✅ Transaction created in database
- ✅ Account balance updated
- ✅ Confirmation message sent

**Convex Logs to Check:**
```
[messageProcessor] Processing update
[rorkIntegration] Processing text with RORK
[expenseActions] Processing expense for user
[telegramAPI] Sending message to chat
```

**If RORK Fails:**
- Should see: `[rorkIntegration] RORK processing failed`
- Should fallback to: keyword detection
- Should still: create expense successfully

---

### ✅ Test 5: Balance Check (CRITICAL)

**Objective:** Verify balance checking works

**Steps:**
1. Send: `/balance`

**Expected Result:**
```
💰 Your Current Balance

🏦 [Account Name]
💵 [Balance] EGP

[➕ Add Expense] [📈 Add Income]
[📊 Chart] [📋 Recent Transactions]
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

**Critical Checks:**
- ✅ `internal.accounts.getUserAccounts` called
- ✅ Balance calculated correctly
- ✅ Quick action buttons displayed
- ✅ No errors in logs

---

### ✅ Test 6: Chart Generation (NEW FEATURE - CRITICAL)

**Objective:** Verify chart generation with QuickChart API

**Steps:**
1. Add a few test expenses first:
   - "I spent 100 on groceries"
   - "I spent 50 on transport"
   - "I spent 30 on entertainment"
2. Send: `/chart`
3. Wait for chart image

**Expected Result:**
```
[Chart Image - Pie chart showing expense breakdown]

📊 Expenses by Category
• Food: 50 EGP (20%)
• Transportation: 50 EGP (20%)
• Entertainment: 30 EGP (12%)
• Shopping: 100 EGP (40%)

💸 Total Expenses: 230 EGP

[🥧 Pie Chart] [📊 Bar Chart]
[📈 Line Chart] [💰 Balance]
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

**Critical Checks:**
- ✅ `internal.chartGenerator.generateChart` called
- ✅ `internal.transactions.getTransactionsByPeriod` returned data
- ✅ QuickChart API URL generated
- ✅ Chart image sent via `internal.telegramAPI.sendPhoto`
- ✅ Chart displays correctly in Telegram
- ✅ Category breakdown accurate
- ✅ Percentages calculated correctly

**Convex Logs to Check:**
```
[chartGenerator] Generating pie chart for user
[telegramAPI] Sending photo to chat
```

**If Chart Fails:**
- Check: QuickChart API response
- Verify: Transaction data exists
- Check: Image URL format

---

### ✅ Test 7: Multiple Chart Types

**Objective:** Verify all chart types work

**Steps:**
1. From previous chart message, click "📊 Bar Chart"
2. Verify bar chart is sent
3. Click "📈 Line Chart"
4. Verify line chart is sent

**Expected Results:**
- Bar chart: Daily expense bars
- Line chart: Spending trend line

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

## Priority 2 Test Scenarios (ERROR HANDLING)

### ✅ Test 8: Invalid Expense Format

**Objective:** Verify error handling for invalid input

**Steps:**
1. Send: `coffee` (no amount)

**Expected Result:**
```
I couldn't find the amount. Example: 'I spent 50 on coffee'
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

### ✅ Test 9: New User Without Account

**Objective:** Verify account creation flow

**Steps:**
1. Use a NEW Telegram account (never used bot before)
2. Send: `/start`
3. Try to add expense: `I spent 50 on coffee`

**Expected Result:**
- Either: Auto-create default account and log expense
- Or: Prompt user to create account first

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

### ✅ Test 10: RORK API Fallback

**Objective:** Verify fallback to keyword detection

**Steps:**
1. Send complex message: `Yesterday I think I maybe spent around 50 or so on some coffee at the cafe`

**Expected Result:**
- RORK may timeout or fail to parse
- Should fallback to keyword detection
- Should still extract: 50, coffee
- Should create expense successfully

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

**Convex Logs to Check:**
```
[rorkIntegration] RORK processing failed (if timeout)
[messageProcessor] Routing by intent (fallback)
[expenseActions] Processing expense (success)
```

---

## Priority 3 Test Scenarios (REGRESSION)

### ✅ Test 11: Arabic Language Support

**Objective:** Verify Arabic language works

**Steps:**
1. Send: `/start`
2. Click "العربية" button
3. Send: `صرفت 100 على القهوة`

**Expected Result:**
```
✅ تم تسجيل المصروف!
💸 100 جنيه - القهوة
💰 الرصيد الجديد: [amount] جنيه
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

### ✅ Test 12: Income Logging

**Objective:** Verify income tracking works

**Steps:**
1. Send: `I received salary 3000`

**Expected Result:**
```
✅ Income logged!
📈 3000 EGP - salary
💰 New balance: [amount] EGP
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

### ✅ Test 13: Recent Transactions

**Objective:** Verify transaction history display

**Steps:**
1. Click "📋 Recent Transactions" button from balance message

**Expected Result:**
```
📋 Recent 5 transactions:

1. 💸 -50 EGP
   📝 coffee
   📅 [date]

2. 📈 +3000 EGP
   📝 salary
   📅 [date]

[...]

[📊 View Chart] [💰 Check Balance]
```

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

## Performance Testing

### ✅ Test 14: Webhook Response Time

**Objective:** Verify <200ms webhook acknowledgment

**Steps:**
1. In Convex Dashboard → Logs
2. Send any message to bot
3. Check log entry for webhook handler
4. Look for: `X-Processing-Time` header or duration log

**Expected Result:**
- Webhook acknowledged in <200ms
- Message processing happens asynchronously

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

### ✅ Test 15: Concurrent Users

**Objective:** Verify system handles multiple users

**Steps:**
1. Use 2-3 different Telegram accounts
2. Send messages simultaneously
3. Verify all messages processed correctly

**Expected Result:**
- All users get responses
- No cross-user data leakage
- No errors in logs

**Actual Result:** ___________________________

**Pass/Fail:** ⬜ PASS  ⬜ FAIL

---

## Test Results Summary

### Overall Statistics

| Category | Tests | Passed | Failed | Blocked |
|----------|-------|--------|--------|---------|
| Priority 1 (Critical) | 7 | ___ | ___ | ___ |
| Priority 2 (Error Handling) | 3 | ___ | ___ | ___ |
| Priority 3 (Regression) | 3 | ___ | ___ | ___ |
| Performance | 2 | ___ | ___ | ___ |
| **TOTAL** | **15** | **___** | **___** | **___** |

### Pass Rate: ____%

---

## Critical Issues Found

### Issue #1: [Title]
**Severity:** Critical / High / Medium / Low  
**Description:** ___________________________  
**Steps to Reproduce:** ___________________________  
**Expected:** ___________________________  
**Actual:** ___________________________  
**Logs:** ___________________________

---

## Performance Metrics

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| Webhook Response Time | <200ms | ___ms | ⬜ |
| Expense Logging Time | <2s | ___s | ⬜ |
| Balance Check Time | <1s | ___s | ⬜ |
| Chart Generation Time | <3s | ___s | ⬜ |

---

## Convex Dashboard Observations

### Function Execution Stats
- Total Invocations: ___
- Success Rate: ___%
- Average Duration: ___ms
- Errors: ___

### Database Operations
- Transactions Created: ___
- Accounts Queried: ___
- User Profiles Updated: ___

### External API Calls
- RORK API Success Rate: ___%
- Telegram API Success Rate: ___%
- QuickChart API Success Rate: ___%

---

## QA Sign-Off

### Test Completion Checklist

- [ ] All Priority 1 tests executed
- [ ] All Priority 2 tests executed
- [ ] All Priority 3 tests executed
- [ ] Performance tests executed
- [ ] Screenshots captured
- [ ] Logs reviewed
- [ ] Issues documented
- [ ] Metrics recorded

### Final Verdict

⬜ **APPROVED FOR PRODUCTION** - All tests passed, no critical issues  
⬜ **APPROVED WITH MINOR ISSUES** - Non-critical issues found, can deploy  
⬜ **REJECTED** - Critical issues found, must fix before deployment

### QA Comments

___________________________
___________________________
___________________________

### Tester Signature

**Name:** ___________________________  
**Date:** ___________________________  
**Time Spent:** ___ hours

---

## Next Steps

### If Approved:
1. Update story status to "Done"
2. Create deployment notes
3. Monitor production for 24 hours
4. Document lessons learned

### If Rejected:
1. Create bug tickets for issues found
2. Assign to developer for fixes
3. Re-test after fixes deployed
4. Re-submit for QA approval

---

*Test Plan Created by: James (Developer)*  
*Date: 2025-10-04*  
*Based on: QA Issue #1 Fix and Story 7.1 Requirements*
