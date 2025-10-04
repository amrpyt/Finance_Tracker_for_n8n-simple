# Telegram Webhook Migration - Production Cutover Plan

**Story:** 6.2 Convex HTTP Actions and Telegram Webhook Migration  
**Date:** 2025-10-03  
**Owner:** James (Dev)

## Overview

This document outlines the safe migration of Telegram webhook handling from the Node.js bot server to Convex HTTP Actions + Trigger.dev task processing.

---

## Pre-Cutover Checklist

### ✅ Infrastructure Ready

- [x] **Trigger.dev Tasks Deployed** - Version 20251003.3 with `telegram:webhook` task
- [x] **Convex HTTP Actions** - `webhookHandler` and `healthCheck` endpoints ready
- [x] **Environment Variables** - Trigger.dev credentials configured
- [ ] **Convex Deployment** - Deploy `telegram.ts` and `triggerTasks.ts` actions
- [x] **Monitoring Setup** - Dashboard access and run tracking available

### 🧪 Testing Completed

- [x] **Task Execution** - `telegram:webhook` task successfully processes test payloads
- [x] **Idempotency** - Duplicate `update_id` handling verified
- [x] **Error Handling** - Graceful error handling and logging confirmed
- [x] **Performance** - Sub-200ms response time target met
- [x] **Concurrency** - Per-user concurrency keys implemented

### 📋 Documentation

- [x] **Webhook URLs** - New Convex endpoints documented
- [x] **Rollback Plan** - Steps to revert webhook URL if needed
- [x] **Monitoring Guide** - Dashboard links and error detection

---

## Cutover Steps

### Phase 1: Staging Validation (30 minutes)

1. **Deploy Convex Functions**
   ```bash
   cd convex
   npx convex deploy
   ```

2. **Get Webhook URLs**
   - Webhook: `https://[convex-deployment]/telegram/webhookHandler`
   - Health: `https://[convex-deployment]/telegram/healthCheck`

3. **Test Health Endpoint**
   ```bash
   curl https://[convex-deployment]/telegram/healthCheck
   # Expected: {"status":"ok","service":"telegram-webhook",...}
   ```

4. **Test Webhook with Sample Payload**
   ```bash
   curl -X POST https://[convex-deployment]/telegram/webhookHandler \
     -H "Content-Type: application/json" \
     -d '{"update_id":12345,"message":{"message_id":1,"from":{"id":123,"first_name":"Test"},"chat":{"id":456},"date":1696368000,"text":"/start"}}'
   # Expected: HTTP 200 "OK"
   ```

5. **Verify Task Execution**
   - Check Trigger.dev dashboard for new runs
   - Confirm proper tags and metadata
   - Validate logs and error handling

### Phase 2: Staging Webhook Update (10 minutes)

1. **Update Bot Webhook URL** (Staging Bot)
   ```bash
   curl -X POST "https://api.telegram.org/bot[STAGING_TOKEN]/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://[convex-deployment]/telegram/webhookHandler"}'
   ```

2. **Verify Webhook Set**
   ```bash
   curl "https://api.telegram.org/bot[STAGING_TOKEN]/getWebhookInfo"
   # Confirm URL matches new endpoint
   ```

3. **End-to-End Testing**
   - Send messages to staging bot
   - Verify task processing in Trigger.dev dashboard
   - Test different message types (commands, text, callbacks)
   - Confirm response times and error handling

### Phase 3: Production Cutover (15 minutes)

1. **Pre-Cutover Verification**
   - Confirm staging tests passed
   - Verify current production bot is working
   - Check Trigger.dev task capacity and health

2. **Update Production Webhook**
   ```bash
   curl -X POST "https://api.telegram.org/bot[PROD_TOKEN]/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://[convex-deployment]/telegram/webhookHandler"}'
   ```

3. **Monitor Initial Traffic**
   - Watch Trigger.dev dashboard for incoming runs
   - Monitor Convex function execution logs
   - Check error rates and response times
   - Validate user interactions work correctly

4. **Verify Full Functionality**
   - Test user commands (/start, /help, /status)
   - Verify language switching works
   - Confirm callback queries process correctly
   - Check error messages are user-friendly

---

## Monitoring During Cutover

### Key Metrics to Watch

1. **Response Time**
   - Target: <200ms for webhook acknowledgment
   - Alert if >500ms consistently

2. **Success Rate**
   - Target: >99% webhook processing success
   - Alert if <95% in 5-minute window

3. **Task Processing**
   - Target: Tasks start within 30 seconds
   - Alert if queue depth >100 tasks

4. **Error Patterns**
   - Monitor for authentication errors
   - Watch for malformed webhook payloads
   - Check for Trigger.dev API failures

### Dashboard Links

- **Trigger.dev Runs**: https://cloud.trigger.dev/projects/v3/proj_xjxlcyltnccogwcsxiir/runs
- **Convex Dashboard**: https://dashboard.convex.dev/
- **Telegram Webhook Info**: `curl "https://api.telegram.org/bot[TOKEN]/getWebhookInfo"`

---

## Rollback Plan

### Immediate Rollback (<5 minutes)

If critical issues are detected:

1. **Revert Webhook URL**
   ```bash
   curl -X POST "https://api.telegram.org/bot[PROD_TOKEN]/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"[OLD_BOT_SERVER_URL]/webhook"}'
   ```

2. **Restart Bot Server** (if needed)
   ```bash
   # On production server
   npm restart
   ```

3. **Verify Rollback**
   - Test bot functionality immediately
   - Confirm webhook info shows old URL
   - Monitor error rates return to baseline

### Rollback Triggers

**Automatic Rollback If:**
- Response time >1000ms for >2 minutes
- Success rate <90% for >5 minutes
- Complete service unavailability >30 seconds

**Manual Rollback If:**
- User reports of bot not responding
- Critical functionality broken
- Excessive error rates in logs

---

## Post-Cutover Tasks

### Immediate (0-2 hours)

1. **Monitor Performance**
   - Check dashboard for 1-2 hours
   - Confirm stable operation
   - Address any minor issues

2. **User Communication**
   - Announce successful migration (if applicable)
   - Monitor user feedback channels

### Short Term (1-7 days)

1. **Performance Analysis**
   - Compare metrics to bot server baseline
   - Identify optimization opportunities
   - Document lessons learned

2. **Bot Server Decommission**
   - Once stable for 24+ hours
   - Archive bot server code and configs
   - Update documentation

---

## Emergency Contacts

- **Primary Developer**: James (Story 6.2 owner)
- **Trigger.dev Support**: Dashboard help section
- **Convex Support**: Dashboard support channel

---

## Risk Assessment

### Low Risk
- ✅ Webhook processing logic tested
- ✅ Idempotency prevents duplicate processing
- ✅ Quick rollback available
- ✅ Non-breaking changes to user experience

### Medium Risk
- ⚠️ New infrastructure dependencies
- ⚠️ Different error handling patterns
- ⚠️ Performance characteristics unknown at scale

### Mitigation
- Staged deployment approach
- Comprehensive monitoring
- Immediate rollback capability
- Minimal user-facing changes

---

**Cutover Window**: Low-traffic hours (e.g., 2-4 AM local time)  
**Expected Duration**: 45-60 minutes total  
**Rollback Time**: <5 minutes if needed
