# Quick Test Reference Card

**Keep this open while testing**

---

## 🚀 Quick Start

1. **Open Telegram** → Find bot: `@FinanceTracker_coderaai_bot`
2. **Open Convex Dashboard** → https://dashboard.convex.dev → Project: `ceaseless-cardinal-528`
3. **Open Test Log** → `TEST_EXECUTION_LOG.md` (fill as you test)

---

## 📝 Test Commands (Copy & Paste)

### Basic Commands
```
/start
/help
/balance
/chart
/status
```

### Test Expenses
```
I spent 50 on coffee
I spent 100 on groceries
I spent 30 on transport
I spent 20 on entertainment
I spent 200 on electricity bill
```

### Test Income
```
I received salary 3000
I received bonus 500
```

### Error Test
```
coffee
```
(Should show error: no amount)

---

## ✅ Expected Results Cheat Sheet

### `/start`
→ Welcome message + language buttons

### `I spent 50 on coffee`
→ ✅ Expense logged! 💸 50 EGP - coffee

### `/balance`
→ 💰 Balance display + quick action buttons

### `/chart`
→ Chart image (pie chart)

### `/help`
→ Help text with commands

---

## 🔍 Where to Check Logs

**Convex Dashboard → Logs Tab**

Filter by:
- `messageProcessor` - Main routing
- `expenseActions` - Expense logging
- `chartGenerator` - Chart creation
- `telegramAPI` - Message sending
- `rorkIntegration` - AI processing

**Look for:**
- ✅ Green = Success
- ❌ Red = Error
- ⚠️ Yellow = Warning

---

## 📊 What to Verify

### After Each Test:
1. ✅ Bot responded correctly
2. ✅ No errors in Convex logs
3. ✅ Data saved in database (check Data tab)
4. ✅ Response time reasonable

### Critical Checks:
- **Expense logging** → Check `transactions` table
- **Balance** → Check `accounts` table  
- **Chart** → Image displays correctly
- **Performance** → <2s for most operations

---

## 🚨 Common Issues & Fixes

### Bot Not Responding
→ Check webhook: `scripts\verify-webhook.ps1`

### Expense Not Logging
→ Check Convex logs for errors
→ Verify `expenseActions` executed

### Chart Not Showing
→ Check `chartGenerator` logs
→ Verify QuickChart URL generated

### Slow Response
→ Check function execution time in logs
→ Look for RORK API timeout

---

## 📸 Screenshots to Capture

1. `/start` welcome message
2. Expense logged confirmation
3. `/balance` display
4. `/chart` pie chart
5. Bar chart
6. Line chart
7. Any errors encountered

---

## ⏱️ Performance Targets

| Operation | Target | How to Measure |
|-----------|--------|----------------|
| Webhook | <200ms | Convex logs |
| Expense | <2s | User experience |
| Balance | <1s | User experience |
| Chart | <3s | User experience |

---

## 🎯 Pass/Fail Criteria

### MUST PASS (Critical):
- ✅ Bot responds to /start
- ✅ Expense logging works
- ✅ Balance displays correctly
- ✅ Chart generates successfully

### SHOULD PASS (Important):
- ✅ All commands work
- ✅ Error handling graceful
- ✅ Performance within targets
- ✅ No data corruption

---

## 📋 Quick Checklist

- [ ] Bot token configured
- [ ] Webhook set
- [ ] Convex deployed
- [ ] Test log ready
- [ ] Dashboard open
- [ ] Telegram open
- [ ] Start testing!

---

**Testing Time:** ~30 minutes for full test  
**Document:** Fill `TEST_EXECUTION_LOG.md` as you go

---

*Quick reference for Story 7.1 testing*
