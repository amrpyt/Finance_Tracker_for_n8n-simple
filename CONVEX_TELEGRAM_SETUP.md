# Convex + Telegram Setup Guide

**Complete guide for deploying the Finance Tracker bot using pure Convex serverless architecture.**

## 🎯 Overview

This project uses a **100% serverless architecture** with:
- **Convex** - Backend, database, and business logic
- **Telegram** - User interface via Bot API
- **RORK AI** - Natural language processing (free API)
- **QuickChart** - Chart generation (free API)

**No servers, no infrastructure, no deployment complexity!**

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** 18.x or higher installed
2. **npm** 9.x or higher
3. **Telegram account** for creating a bot
4. **Convex account** (free tier) - Sign up at [convex.dev](https://convex.dev)

---

## 🚀 Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd Finance_Tracker_for_n8n-simple

# Install dependencies
npm install
```

---

## 🤖 Step 2: Create Telegram Bot

1. **Open Telegram** and search for [@BotFather](https://t.me/botfather)

2. **Create a new bot:**
   ```
   /newbot
   ```

3. **Follow the prompts:**
   - Choose a name for your bot (e.g., "My Finance Tracker")
   - Choose a username (must end with "bot", e.g., "my_finance_tracker_bot")

4. **Save your bot token** - You'll receive something like:
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

5. **Configure bot settings** (optional but recommended):
   ```
   /setdescription - Set bot description
   /setabouttext - Set about text
   /setuserpic - Upload bot profile picture
   ```

---

## ⚡ Step 3: Initialize Convex

1. **Start Convex development server:**
   ```bash
   npx convex dev
   ```

2. **Follow the prompts:**
   - Create a new Convex project or select existing
   - Choose a project name (e.g., "finance-tracker")
   - Convex will automatically generate your deployment URL

3. **Your Convex URL** will look like:
   ```
   https://your-project-name.convex.cloud
   ```

---

## 🔐 Step 4: Configure Environment Variables

1. **Open Convex Dashboard** at [dashboard.convex.dev](https://dashboard.convex.dev)

2. **Navigate to your project** → **Settings** → **Environment Variables**

3. **Add the following variable:**
   - **Key:** `TELEGRAM_BOT_TOKEN`
   - **Value:** Your bot token from Step 2
   - Click **Save**

**Note:** RORK AI and QuickChart APIs don't require authentication!

---

## 📡 Step 5: Deploy to Convex

1. **Deploy your functions:**
   ```bash
   npm run deploy
   ```
   
   This command runs `npx convex deploy` and deploys all your Convex functions.

2. **Verify deployment:**
   - Check the Convex dashboard
   - Ensure all functions are deployed successfully
   - Note your HTTP Action URL (you'll need it for the webhook)

---

## 🔗 Step 6: Set Up Telegram Webhook

1. **Get your webhook URL:**
   - Your Convex HTTP Action URL: `https://your-project.convex.cloud/telegram/webhookHandler`
   - Format: `https://<YOUR_CONVEX_DEPLOYMENT_URL>/telegram/webhookHandler`

2. **Set the webhook using curl:**
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
        -H "Content-Type: application/json" \
        -d '{"url":"https://your-project.convex.cloud/telegram/webhookHandler"}'
   ```

   **Replace:**
   - `<YOUR_BOT_TOKEN>` with your actual bot token
   - `https://your-project.convex.cloud` with your actual Convex URL

3. **Verify webhook is set:**
   ```bash
   curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
   ```

   You should see:
   ```json
   {
     "ok": true,
     "result": {
       "url": "https://your-project.convex.cloud/telegram/webhookHandler",
       "has_custom_certificate": false,
       "pending_update_count": 0
     }
   }
   ```

---

## ✅ Step 7: Test Your Bot

1. **Open Telegram** and search for your bot by username

2. **Start the bot:**
   ```
   /start
   ```

3. **You should receive a welcome message** with bot capabilities

4. **Test basic commands:**
   ```
   /help
   /balance
   ```

5. **Test natural language:**
   ```
   paid 50 for coffee
   received salary 5000
   show my balance
   ```

---

## 🔍 Monitoring and Debugging

### View Logs in Convex Dashboard

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Click **Logs** in the sidebar
4. Filter by function name (e.g., `telegram:webhookHandler`, `messageProcessor`)

### Common Issues

**Bot not responding:**
- Check webhook is set correctly: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Verify Convex deployment is successful
- Check Convex logs for errors

**"Invalid bot token" error:**
- Verify `TELEGRAM_BOT_TOKEN` in Convex environment variables
- Ensure no extra spaces or quotes in the token

**RORK AI errors:**
- RORK API is free and doesn't require authentication
- Check if `https://toolkit.rork.com` is accessible
- Review error logs in Convex dashboard

---

## 🔄 Development Workflow

### Local Development

```bash
# Start Convex dev server (watches for changes)
npm run dev
```

This starts Convex in development mode:
- Auto-deploys changes to your dev environment
- Provides real-time logs
- Enables hot reloading

### Making Changes

1. **Edit Convex functions** in `convex/` directory
2. **Convex automatically redeploys** on save
3. **Test changes** immediately via Telegram bot

### Deploying to Production

```bash
# Deploy to production
npm run deploy
```

**Important:** Update your Telegram webhook URL if your Convex deployment URL changes!

---

## 📊 Architecture Overview

```
┌─────────────────┐
│  Telegram User  │
└────────┬────────┘
         │ Messages
         ▼
┌─────────────────┐
│  Telegram API   │
└────────┬────────┘
         │ Webhook
         ▼
┌─────────────────────────────────┐
│  Convex HTTP Action             │
│  (telegram.ts)                  │
│  - Fast webhook acknowledgment  │
│  - Request validation           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Convex Actions                 │
│  - messageProcessor.ts          │
│  - expenseActions.ts            │
│  - balanceActions.ts            │
│  - chartGenerator.ts            │
└────────┬────────────────────────┘
         │
         ├──────────────┬─────────────┐
         ▼              ▼             ▼
┌──────────────┐  ┌──────────┐  ┌──────────┐
│  Convex DB   │  │ RORK AI  │  │QuickChart│
│  (Schema)    │  │  (Free)  │  │  (Free)  │
└──────────────┘  └──────────┘  └──────────┘
```

---

## 🎉 Success!

Your Finance Tracker bot is now live and running on pure Convex + Telegram architecture!

**Next Steps:**
- Customize bot messages in `convex/messageProcessor.ts`
- Add new features by creating Convex actions
- Monitor usage in Convex dashboard
- Scale automatically with Convex (no configuration needed!)

---

## 📚 Additional Resources

- **Convex Documentation:** https://docs.convex.dev
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **RORK Toolkit:** https://toolkit.rork.com
- **QuickChart API:** https://quickchart.io

---

## 🆘 Need Help?

- **Convex Discord:** https://convex.dev/community
- **Project Issues:** Create an issue in the GitHub repository
- **Telegram Bot Support:** https://core.telegram.org/bots/faq

---

**Built with ❤️ using Convex and Telegram**
