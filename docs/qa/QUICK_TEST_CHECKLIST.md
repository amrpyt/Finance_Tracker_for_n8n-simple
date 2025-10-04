# Quick Test Checklist - Story 7.1

**Use this for rapid smoke testing after deployment**

---

## ⚡ 5-Minute Smoke Test

### Setup (1 min)
- [ ] Convex dashboard shows all functions deployed
- [ ] TELEGRAM_BOT_TOKEN environment variable set
- [ ] Webhook URL configured in Telegram

### Core Flow (4 min)
- [ ] `/start` → Welcome message received
- [ ] `I spent 50 on coffee` → Expense logged
- [ ] `/balance` → Balance displayed
- [ ] `/chart` → Chart image received
- [ ] `/help` → Help text displayed

**If all ✅ → System is operational**

---

## 🔥 Critical Path Test (15 min)

### User Journey: New User First Expense

1. **Start Bot**
   - [ ] Send `/start`
   - [ ] Receive welcome + language buttons
   - [ ] Click "English"
   - [ ] Receive confirmation

2. **Log First Expense**
   - [ ] Send: `I spent 50 on coffee`
   - [ ] Receive: Expense logged confirmation
   - [ ] Verify: Amount (50), Description (coffee), Balance updated

3. **Check Balance**
   - [ ] Send: `/balance`
   - [ ] Receive: Account balance display
   - [ ] Verify: Balance matches expense

4. **Generate Chart**
   - [ ] Send: `/chart`
   - [ ] Receive: Chart image
   - [ ] Verify: Chart shows coffee expense

5. **Add More Expenses**
   - [ ] Send: `I spent 100 on groceries`
   - [ ] Send: `I spent 30 on transport`
   - [ ] Send: `/chart`
   - [ ] Verify: Chart shows all 3 categories

**Expected Time:** 10-15 minutes  
**Pass Criteria:** All steps complete without errors

---

## 🎯 Feature Validation Matrix

| Feature | Command/Action | Expected Result | Status |
|---------|---------------|-----------------|--------|
| **Bot Startup** | `/start` | Welcome message | ⬜ |
| **Language EN** | Click "English" | Confirmation | ⬜ |
| **Language AR** | Click "العربية" | تأكيد | ⬜ |
| **Help** | `/help` | Help text | ⬜ |
| **Status** | `/status` | System status | ⬜ |
| **Expense (NL)** | `spent 50 coffee` | Logged | ⬜ |
| **Expense (AR)** | `صرفت 50 قهوة` | مسجل | ⬜ |
| **Income** | `received 3000` | Logged | ⬜ |
| **Balance** | `/balance` | Balance shown | ⬜ |
| **Chart Pie** | `/chart` | Pie chart | ⬜ |
| **Chart Bar** | Click bar button | Bar chart | ⬜ |
| **Chart Line** | Click line button | Line chart | ⬜ |
| **Transactions** | Click recent button | List shown | ⬜ |

**Pass Rate:** ___/13 (___%)

---

## 🚨 Error Scenarios

| Scenario | Input | Expected Behavior | Status |
|----------|-------|-------------------|--------|
| **No Amount** | `coffee` | Error message | ⬜ |
| **Invalid Command** | `/invalid` | Unknown command | ⬜ |
| **Empty Message** | ` ` (space) | Error/ignore | ⬜ |
| **Very Long Text** | 500 char message | Truncated/handled | ⬜ |
| **Special Chars** | `<script>alert()</script>` | Sanitized | ⬜ |

---

## 📊 Performance Checks

| Metric | Target | How to Measure | Result |
|--------|--------|----------------|--------|
| **Webhook Response** | <200ms | Convex logs | ___ms |
| **Expense Logging** | <2s | User experience | ___s |
| **Balance Check** | <1s | User experience | ___s |
| **Chart Generation** | <3s | User experience | ___s |

---

## 🔍 Convex Dashboard Checks

### Functions Tab
- [ ] All 10+ functions visible
- [ ] No failed deployments
- [ ] Recent executions showing

### Logs Tab
- [ ] No error logs (red)
- [ ] Successful executions (green)
- [ ] Performance metrics reasonable

### Data Tab
- [ ] `userProfiles` table has entries
- [ ] `transactions` table has entries
- [ ] `accounts` table has entries
- [ ] `users` table has entries

---

## ✅ Sign-Off

**Tester:** _______________  
**Date:** _______________  
**Duration:** ___ minutes  
**Result:** ⬜ PASS  ⬜ FAIL

**Issues Found:** _______________

---

*Quick reference for Story 7.1 validation*
