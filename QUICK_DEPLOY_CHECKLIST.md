# ✅ Quick Deploy Checklist - Convex + Telegram

**Use this checklist to deploy your Finance Tracker bot in under 10 minutes!**

---

## 📋 Pre-Deployment

- [ ] **Node.js 18+** installed
- [ ] **npm 9+** installed
- [ ] **Git** repository cloned
- [ ] **Convex account** created at [convex.dev](https://convex.dev)
- [ ] **Telegram account** available

---

## 🤖 Step 1: Create Telegram Bot (2 minutes)

- [ ] Open Telegram and search for **@BotFather**
- [ ] Send `/newbot` command
- [ ] Choose bot name (e.g., "My Finance Tracker")
- [ ] Choose username (must end with "bot", e.g., "my_finance_bot")
- [ ] **Save bot token** (format: `1234567890:ABCdef...`)
- [ ] (Optional) Set bot description with `/setdescription`
- [ ] (Optional) Upload bot picture with `/setuserpic`

**Bot Token:** `_______________________________________`

---

## ⚡ Step 2: Install Dependencies (1 minute)

```bash
cd Finance_Tracker_for_n8n-simple
npm install
```

- [ ] Dependencies installed successfully
- [ ] No errors in console

---

## 🚀 Step 3: Initialize Convex (2 minutes)

```bash
npx convex dev
```

**Follow prompts:**
- [ ] Create new project or select existing
- [ ] Choose project name
- [ ] Wait for deployment to complete

**Convex URL:** `https://_________________.convex.cloud`

---

## 🔐 Step 4: Configure Environment (1 minute)

1. **Open Convex Dashboard:**
   - [ ] Go to [dashboard.convex.dev](https://dashboard.convex.dev)
   - [ ] Select your project

2. **Add Environment Variable:**
   - [ ] Click **Settings** → **Environment Variables**
   - [ ] Add variable:
     - **Key:** `TELEGRAM_BOT_TOKEN`
     - **Value:** Your bot token from Step 1
   - [ ] Click **Save**

---

## 📡 Step 5: Deploy to Production (1 minute)

```bash
npm run deploy
```

- [ ] Deployment successful
- [ ] No errors in console
- [ ] Functions deployed to Convex Cloud

---

## 🔗 Step 6: Set Telegram Webhook (2 minutes)

**Your webhook URL:**
```
https://YOUR_CONVEX_URL/telegram/webhookHandler
```

**Set webhook (choose one method):**

### Method A: Using curl (Recommended)
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url":"https://YOUR_CONVEX_URL/telegram/webhookHandler"}'
```

### Method B: Using browser
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://YOUR_CONVEX_URL/telegram/webhookHandler
```

**Verify webhook:**
```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

- [ ] Webhook set successfully
- [ ] Response shows correct URL
- [ ] `pending_update_count` is 0

---

## ✅ Step 7: Test Your Bot (1 minute)

1. **Open Telegram** and find your bot

2. **Test commands:**
   - [ ] Send `/start` → Receive welcome message
   - [ ] Send `/help` → Receive help text
   - [ ] Send `/balance` → Receive balance info
   - [ ] Send "paid 50 for coffee" → AI processes expense
   - [ ] Send "show my balance" → Natural language works

3. **Check Convex logs:**
   - [ ] Open Convex Dashboard → Logs
   - [ ] See webhook requests
   - [ ] No errors in logs

---

## 🎉 Success Criteria

Your bot is ready when:

- [x] Bot responds to `/start` command
- [x] Natural language processing works
- [x] Expenses are logged correctly
- [x] Balance updates in real-time
- [x] No errors in Convex logs
- [x] Webhook status shows `pending_update_count: 0`

---

## 🔍 Troubleshooting

### Bot Not Responding

**Check:**
1. Webhook URL is correct
2. `TELEGRAM_BOT_TOKEN` is set in Convex
3. Convex deployment succeeded
4. No errors in Convex logs

**Fix:**
```bash
# Redeploy
npm run deploy

# Reset webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d '{"url":"https://YOUR_CONVEX_URL/telegram/webhookHandler"}'
```

### "Invalid Bot Token" Error

**Check:**
1. Token copied correctly (no spaces)
2. Token saved in Convex environment variables
3. Token is valid: `curl https://api.telegram.org/bot<TOKEN>/getMe`

**Fix:**
- Update token in Convex Dashboard → Settings → Environment Variables

### Webhook Not Set

**Check:**
```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

**Fix:**
```bash
# Delete old webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/deleteWebhook"

# Set new webhook
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d '{"url":"https://YOUR_CONVEX_URL/telegram/webhookHandler"}'
```

---

## 📚 Next Steps

After successful deployment:

1. **Customize bot messages:**
   - Edit `convex/messageProcessor.ts`
   - Modify welcome message
   - Adjust AI prompts

2. **Monitor usage:**
   - Check Convex Dashboard daily
   - Review function call metrics
   - Monitor error rates

3. **Add features:**
   - Implement loan tracking
   - Add transaction filters
   - Create budget alerts

4. **Share with users:**
   - Share bot username
   - Create user guide
   - Collect feedback

---

## 📊 Deployment Summary

**Time to Deploy:** ~10 minutes  
**Infrastructure:** Zero (fully serverless)  
**Cost:** Free tier (up to 30K users)  
**Maintenance:** Minimal (automatic scaling)

---

## 🆘 Need Help?

- **Setup Guide:** CONVEX_TELEGRAM_SETUP.md
- **Deployment Guide:** DEPLOYMENT.md
- **Migration Summary:** MIGRATION_COMPLETE.md
- **Convex Docs:** https://docs.convex.dev
- **Telegram Bot API:** https://core.telegram.org/bots/api

---

**Congratulations! Your Finance Tracker bot is live! 🎉**

---

**Built with ❤️ using Convex and Telegram**
