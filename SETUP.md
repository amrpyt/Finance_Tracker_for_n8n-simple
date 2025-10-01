# Setup Guide

## ✅ Convex Configuration Complete

Your Convex deployment is configured and ready to use!

### Deployment Details

- **Deployment URL:** `https://genral-data-bases-convex-1faac1-156-67-25-212.coderaai.com`
- **Status:** Self-hosted Convex instance
- **Admin Key:** Configured in `convex/.env.local`

### Environment Files Created

✅ `.env` files have been created from templates with your Convex configuration:
- `/.env` - Root environment
- `/bot/.env` - Bot server environment  
- `/convex/.env.local` - Convex backend environment

### 🔒 Security Notice

**IMPORTANT:** Your Convex admin key is now in the following files:
- `convex/.env.local` (gitignored ✅)
- `convex/.env.local.example` (committed to git ⚠️)

**Action Required:**
If this is a production deployment, you should:
1. Rotate your admin key in the Convex dashboard
2. Update `convex/.env.local` with the new key
3. Remove the key from `convex/.env.local.example` before pushing to public repos

### Next Steps

1. **Get Telegram Bot Token**
   ```bash
   # Visit @BotFather on Telegram
   # Create a new bot or use existing one
   # Copy the token
   ```

2. **Update Environment Files**
   ```bash
   # Edit .env and bot/.env
   # Replace: TELEGRAM_BOT_TOKEN=your_bot_token_here
   # With your actual token
   ```

3. **Deploy Convex Schema**
   ```bash
   cd convex
   npx convex deploy
   ```

4. **Start Development**
   ```bash
   # Terminal 1: Start Convex dev
   cd convex
   npx convex dev

   # Terminal 2: Start bot server (Story 1.2)
   cd bot
   npm run dev
   ```

### Verification

Test your Convex connection:
```bash
cd convex
npx convex env list
```

This should show your configured environment variables.

---

**Setup Status:** ✅ Convex configured, waiting for Telegram bot token
