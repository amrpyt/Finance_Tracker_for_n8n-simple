# Deployment Guide - Pure Convex + Telegram Architecture

**Complete deployment guide for the Finance Tracker Telegram bot using 100% serverless Convex architecture.**

---

## 🎯 Deployment Overview

This project uses **pure Convex serverless architecture** - no servers, no containers, no infrastructure management!

**Deployment Targets:**
- ✅ **Convex Cloud** (Primary) - Fully managed serverless platform
- ✅ **Telegram Bot API** - Webhook integration

**What you DON'T need:**
- ❌ No VPS or cloud servers
- ❌ No Docker containers
- ❌ No Kubernetes clusters
- ❌ No load balancers
- ❌ No reverse proxies

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Convex account created at [convex.dev](https://convex.dev)
- [ ] Telegram bot created via [@BotFather](https://t.me/botfather)
- [ ] Bot token saved securely
- [ ] Node.js 18+ and npm 9+ installed
- [ ] Repository cloned and dependencies installed (`npm install`)

---

## 🚀 Deployment Steps

### Step 1: Initialize Convex Project

```bash
# Navigate to project directory
cd Finance_Tracker_for_n8n-simple

# Initialize Convex (first time only)
npx convex dev
```

**What happens:**
1. Convex CLI prompts you to create/select a project
2. Generates `.convex/` directory with configuration
3. Creates a deployment URL (e.g., `https://your-project.convex.cloud`)
4. Starts development server with hot reloading

**Save your deployment URL** - you'll need it for the webhook!

---

### Step 2: Configure Environment Variables

1. **Open Convex Dashboard:**
   - Go to [dashboard.convex.dev](https://dashboard.convex.dev)
   - Select your project

2. **Navigate to Settings → Environment Variables**

3. **Add required variables:**

   | Variable Name | Value | Required |
   |--------------|-------|----------|
   | `TELEGRAM_BOT_TOKEN` | Your bot token from BotFather | ✅ Yes |

4. **Click Save**

**Note:** RORK AI and QuickChart APIs are free and don't require authentication!

---

### Step 3: Deploy to Production

```bash
# Deploy all Convex functions to production
npm run deploy
```

**This command:**
- Compiles TypeScript to JavaScript
- Uploads functions to Convex Cloud
- Deploys database schema
- Generates production deployment URL

**Verify deployment:**
```bash
# Check deployment status
npx convex dashboard
```

---

### Step 4: Set Up Telegram Webhook

**Get your webhook URL:**
```
https://<YOUR_CONVEX_DEPLOYMENT_URL>/telegram/webhookHandler
```

**Example:**
```
https://ceaseless-cardinal-528.convex.cloud/telegram/webhookHandler
```

**Set the webhook:**

**Option A: Using curl (Recommended)**
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://your-project.convex.cloud/telegram/webhookHandler"}'
```

**Option B: Using browser**
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-project.convex.cloud/telegram/webhookHandler
```

**Verify webhook:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

**Expected response:**
```json
{
  "ok": true,
  "result": {
    "url": "https://your-project.convex.cloud/telegram/webhookHandler",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40
  }
}
```

---

### Step 5: Test Deployment

1. **Open Telegram** and find your bot

2. **Send `/start` command**

3. **Expected response:**
   ```
   👋 Welcome to Finance Tracker!
   
   I'm your personal finance assistant...
   ```

4. **Test commands:**
   ```
   /help
   /balance
   paid 50 for coffee
   ```

5. **Check Convex logs:**
   - Go to Convex Dashboard → Logs
   - Verify webhook requests are being received
   - Check for any errors

---

## 🔄 Continuous Deployment

### Automatic Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Convex

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Deploy to Convex
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
        run: npx convex deploy --prod
```

**Setup:**
1. Get deploy key from Convex Dashboard → Settings → Deploy Keys
2. Add `CONVEX_DEPLOY_KEY` to GitHub Secrets
3. Push to main branch triggers automatic deployment

---

## 🔐 Security Best Practices

### Environment Variables

✅ **DO:**
- Store bot token in Convex environment variables
- Use Convex Dashboard to manage secrets
- Rotate tokens periodically

❌ **DON'T:**
- Commit tokens to Git
- Share tokens publicly
- Hardcode secrets in code

### Webhook Security

✅ **DO:**
- Use HTTPS for webhook URL (Convex provides this)
- Validate incoming requests in `telegram.ts`
- Implement rate limiting

❌ **DON'T:**
- Use HTTP (insecure)
- Skip request validation
- Expose internal errors to users

---

## 📊 Monitoring and Maintenance

### Convex Dashboard

**Access:** [dashboard.convex.dev](https://dashboard.convex.dev)

**Key Sections:**
- **Logs:** Real-time function execution logs
- **Data:** Browse database tables and documents
- **Functions:** View deployed functions and their status
- **Metrics:** Monitor function calls, latency, and errors

### Health Checks

**Webhook health check:**
```bash
curl https://your-project.convex.cloud/telegram/healthCheck
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "telegram-webhook",
  "timestamp": "2025-10-04T15:30:00.000Z",
  "version": "7.1.0"
}
```

### Performance Monitoring

**Key Metrics:**
- **Webhook Response Time:** Should be < 200ms
- **Message Processing Time:** Should be < 2s
- **Database Query Time:** Should be < 100ms
- **External API Calls:** RORK ~1-3s, QuickChart ~500ms

**View in Convex Dashboard:**
- Go to Functions → Select function → View metrics

---

## 🐛 Troubleshooting

### Bot Not Responding

**Check webhook status:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Common issues:**
- Webhook URL incorrect
- Convex deployment failed
- Environment variables not set

**Solution:**
1. Verify webhook URL matches Convex deployment URL
2. Check Convex logs for errors
3. Redeploy: `npm run deploy`

### "Invalid Bot Token" Error

**Symptoms:**
- 401 Unauthorized from Telegram API
- Bot not responding to messages

**Solution:**
1. Verify `TELEGRAM_BOT_TOKEN` in Convex Dashboard
2. Ensure no extra spaces or quotes
3. Test token: `curl https://api.telegram.org/bot<TOKEN>/getMe`

### RORK AI Errors

**Symptoms:**
- Natural language processing fails
- "AI processing failed" messages

**Solution:**
1. Check RORK API status: `curl https://toolkit.rork.com/text/llm/`
2. Review error logs in Convex Dashboard
3. RORK is free - no authentication needed

### Database Errors

**Symptoms:**
- "User not found" errors
- Transaction save failures

**Solution:**
1. Check Convex Dashboard → Data
2. Verify schema is deployed: `npx convex deploy`
3. Review database indexes in `convex/schema.ts`

---

## 🔄 Rollback Procedure

If deployment fails or introduces bugs:

1. **View deployment history:**
   ```bash
   npx convex dashboard
   ```
   Go to Deployments → View history

2. **Rollback to previous version:**
   - Convex Dashboard → Deployments
   - Select previous deployment
   - Click "Restore"

3. **Or redeploy from Git:**
   ```bash
   git checkout <previous-commit>
   npm run deploy
   ```

---

## 📈 Scaling Considerations

### Convex Free Tier Limits

- **Function Calls:** 1M per month
- **Database Storage:** 1 GB
- **Bandwidth:** 10 GB per month

**Estimated Capacity:**
- ~30,000 active users
- ~100,000 transactions per month
- ~1,000 concurrent users

### Upgrading to Pro

When you exceed free tier:
1. Go to Convex Dashboard → Billing
2. Upgrade to Pro plan
3. Automatic scaling - no code changes needed!

**Pro Plan Benefits:**
- Unlimited function calls
- Unlimited storage
- Priority support
- Advanced monitoring

---

## 🎉 Deployment Complete!

Your Finance Tracker bot is now deployed and running on pure Convex + Telegram architecture!

**What you've achieved:**
- ✅ Zero-infrastructure deployment
- ✅ Automatic scaling
- ✅ Real-time monitoring
- ✅ Secure environment variable management
- ✅ Production-ready bot

**Next Steps:**
- Monitor usage in Convex Dashboard
- Set up GitHub Actions for CI/CD
- Customize bot features
- Scale automatically as users grow!

---

## 📚 Additional Resources

- **Convex Documentation:** https://docs.convex.dev
- **Convex Deployment Guide:** https://docs.convex.dev/production/hosting
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Webhook Setup:** https://core.telegram.org/bots/webhooks

---

**Built with ❤️ using Convex and Telegram**
