# Testing Resources Index - Story 7.1

**Complete guide to all testing resources and how to use them**

---

## 📚 Available Resources

### 1. **Comprehensive Test Plan**
**File:** `MANUAL_TEST_EXECUTION_GUIDE.md`  
**Purpose:** Detailed step-by-step testing guide with 15 test scenarios  
**Use When:** Performing full QA validation before production  
**Time Required:** 2-4 hours  
**Includes:**
- ✅ 7 Priority 1 (Critical) tests
- ✅ 3 Priority 2 (Error Handling) tests
- ✅ 3 Priority 3 (Regression) tests
- ✅ 2 Performance tests
- ✅ Screenshot templates
- ✅ Log verification steps
- ✅ QA sign-off form

### 2. **Quick Test Checklist**
**File:** `QUICK_TEST_CHECKLIST.md`  
**Purpose:** Rapid smoke testing after deployment  
**Use When:** Quick verification that system is operational  
**Time Required:** 5-15 minutes  
**Includes:**
- ⚡ 5-minute smoke test
- 🔥 15-minute critical path test
- 🎯 Feature validation matrix
- 🚨 Error scenario checks
- 📊 Performance metrics

### 3. **Webhook Verification Script**
**File:** `scripts/verify-webhook.ps1`  
**Purpose:** Automated webhook configuration verification  
**Use When:** Setting up or troubleshooting webhook  
**Time Required:** 1 minute  
**Features:**
- ✅ Validates bot token
- ✅ Checks current webhook
- ✅ Sets webhook URL
- ✅ Tests endpoint reachability
- ✅ Verifies update processing

**Usage:**
```powershell
cd scripts
.\verify-webhook.ps1 -BotToken "YOUR_BOT_TOKEN"
```

### 4. **Test Data Generator**
**File:** `scripts/generate-test-data.md`  
**Purpose:** Pre-defined test messages for comprehensive testing  
**Use When:** Need to test charts and data visualization  
**Includes:**
- 📝 Quick test set (5 expenses)
- 📝 Comprehensive set (15 expenses)
- 📝 Income test data
- 📝 Arabic test data
- 📝 Edge cases
- 📝 Chart testing scenarios

### 5. **Issue Fix Summary**
**File:** `7.1-issue-1-fix-summary.md`  
**Purpose:** Documentation of critical issue resolution  
**Use When:** Understanding what was fixed and why  
**Includes:**
- 🔧 Problem statement
- 🔧 Root cause analysis
- 🔧 Files changed
- 🔧 Verification steps
- 🔧 Deployment status

### 6. **Original Test Plan**
**File:** `7.1-convex-migration-test-plan.md`  
**Purpose:** QA's comprehensive assessment and test strategy  
**Use When:** Understanding QA requirements and issues  
**Includes:**
- 🚨 Critical findings
- 📋 Test scenarios
- ⚠️ Risk assessment
- ✅ Quality gate criteria

---

## 🎯 Testing Workflow

### Phase 1: Pre-Testing Setup (5 min)

1. **Verify Deployment**
   ```
   ✅ Check: https://dashboard.convex.dev
   ✅ Verify: All functions deployed
   ✅ Confirm: No errors in logs
   ```

2. **Configure Webhook**
   ```powershell
   cd scripts
   .\verify-webhook.ps1 -BotToken "YOUR_TOKEN"
   ```

3. **Verify Environment**
   ```
   ✅ TELEGRAM_BOT_TOKEN set in Convex
   ✅ Webhook URL configured
   ✅ Test Telegram account ready
   ```

### Phase 2: Smoke Test (5 min)

**Use:** `QUICK_TEST_CHECKLIST.md` → 5-Minute Smoke Test

```
1. /start → Welcome message
2. I spent 50 on coffee → Expense logged
3. /balance → Balance shown
4. /chart → Chart displayed
5. /help → Help text shown
```

**If all pass → Proceed to Phase 3**  
**If any fail → Check logs, fix issues, repeat**

### Phase 3: Critical Path Test (15 min)

**Use:** `QUICK_TEST_CHECKLIST.md` → Critical Path Test

```
1. New user journey
2. First expense
3. Balance check
4. Chart generation
5. Multiple expenses
```

**If all pass → Proceed to Phase 4**  
**If any fail → Document issues, investigate**

### Phase 4: Comprehensive Testing (2-4 hours)

**Use:** `MANUAL_TEST_EXECUTION_GUIDE.md`

Execute all 15 test scenarios:
- Priority 1: Critical features
- Priority 2: Error handling
- Priority 3: Regression tests
- Performance: Response times

**Document results in the guide**

### Phase 5: Test Data Validation (30 min)

**Use:** `scripts/generate-test-data.md`

1. Generate comprehensive test data
2. Test all chart types
3. Verify calculations
4. Test edge cases

### Phase 6: QA Sign-Off

**Use:** `MANUAL_TEST_EXECUTION_GUIDE.md` → QA Sign-Off Section

1. Complete all checklists
2. Document issues found
3. Record performance metrics
4. Make final verdict
5. Sign off

---

## 🔍 Troubleshooting Guide

### Issue: Bot Not Responding

**Check:**
1. Webhook configured? → Run `verify-webhook.ps1`
2. Convex deployed? → Check dashboard
3. Environment variables set? → Check Convex settings
4. Logs show errors? → Check Convex logs tab

**Fix:**
```powershell
# Re-run webhook setup
.\verify-webhook.ps1 -BotToken "YOUR_TOKEN"

# Re-deploy Convex
cd ..
npm run deploy
```

### Issue: Expense Not Logging

**Check:**
1. User profile created? → Check `userProfiles` table
2. Account exists? → Check `accounts` table
3. RORK API working? → Check logs for `rorkIntegration`
4. Transaction created? → Check `transactions` table

**Debug:**
```
Convex Dashboard → Logs → Filter: "expenseActions"
Look for: Error messages, stack traces
```

### Issue: Chart Not Generating

**Check:**
1. Transactions exist? → Query `transactions` table
2. QuickChart API called? → Check logs for `chartGenerator`
3. Image URL valid? → Copy URL, test in browser
4. Telegram API working? → Check logs for `telegramAPI`

**Debug:**
```
Convex Dashboard → Logs → Filter: "chartGenerator"
Look for: QuickChart URL, API errors
```

### Issue: Performance Slow

**Check:**
1. Webhook response time → Convex logs
2. Database query time → Function execution time
3. External API latency → RORK/Telegram/QuickChart logs
4. Concurrent users → Check active sessions

**Optimize:**
- Review database indexes
- Check external API timeouts
- Monitor Convex function duration

---

## 📊 Success Criteria

### Minimum Acceptance Criteria

- ✅ All Priority 1 tests pass (7/7)
- ✅ No critical errors in logs
- ✅ Webhook response time <200ms
- ✅ Chart generation works
- ✅ Data integrity maintained

### Recommended Acceptance Criteria

- ✅ All tests pass (15/15)
- ✅ Performance within targets
- ✅ Error handling graceful
- ✅ Multi-language support works
- ✅ No data leakage between users

### Production Ready Criteria

- ✅ QA approved
- ✅ All issues documented
- ✅ Performance validated
- ✅ 24-hour monitoring plan
- ✅ Rollback plan ready

---

## 📝 Test Result Templates

### Quick Test Result
```
Date: ___________
Tester: ___________
Duration: ___ minutes
Result: PASS / FAIL
Issues: ___________
```

### Comprehensive Test Result
```
Date: ___________
Tester: ___________
Duration: ___ hours
Tests Executed: ___/15
Pass Rate: ___%
Critical Issues: ___
Medium Issues: ___
Minor Issues: ___
Performance: PASS / FAIL
Verdict: APPROVED / REJECTED
```

---

## 🚀 Next Steps After Testing

### If All Tests Pass:
1. ✅ Update story status to "Done"
2. ✅ Create deployment notes
3. ✅ Monitor production for 24 hours
4. ✅ Document lessons learned
5. ✅ Archive test results

### If Issues Found:
1. 🔴 Create bug tickets
2. 🔴 Prioritize by severity
3. 🔴 Assign to developer
4. 🔴 Re-test after fixes
5. 🔴 Re-submit for QA

### If Critical Issues:
1. 🚨 Halt deployment
2. 🚨 Notify team
3. 🚨 Emergency fix
4. 🚨 Full re-test
5. 🚨 Post-mortem

---

## 📞 Support Resources

### Convex Dashboard
- URL: https://dashboard.convex.dev
- Project: ceaseless-cardinal-528
- Use for: Logs, data, function monitoring

### Telegram Bot API
- Docs: https://core.telegram.org/bots/api
- Use for: Webhook setup, API reference

### QuickChart API
- Docs: https://quickchart.io/documentation/
- Use for: Chart generation reference

### RORK API
- Endpoint: https://toolkit.rork.com/text/llm/
- Use for: AI processing

---

## ✅ Testing Checklist Summary

### Before Testing
- [ ] Read this index
- [ ] Review test plan
- [ ] Set up environment
- [ ] Configure webhook

### During Testing
- [ ] Follow test scenarios
- [ ] Document results
- [ ] Capture screenshots
- [ ] Record metrics

### After Testing
- [ ] Complete sign-off
- [ ] Submit results
- [ ] Create bug tickets
- [ ] Archive documentation

---

**All resources are in:** `docs/qa/` and `scripts/`  
**Start with:** `QUICK_TEST_CHECKLIST.md` for rapid validation  
**Full testing:** `MANUAL_TEST_EXECUTION_GUIDE.md`

---

*Testing Resources Created by: James (Developer)*  
*Date: 2025-10-04*  
*For: Story 7.1 - Convex-Only Migration*
