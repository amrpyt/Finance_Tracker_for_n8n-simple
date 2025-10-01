# Bot Server

This directory contains the Telegram bot server for the Personal Finance Tracker.

## Structure

- `src/index.ts` - Main entry point (Express server)
- `src/bot.ts` - Telegram bot initialization
- `src/config/` - Configuration and environment setup
- `src/handlers/` - Message and command handlers
- `src/services/` - Business logic services
- `src/utils/` - Utility functions
- `src/types/` - TypeScript type definitions
- `tests/` - Unit and integration tests

## Bot Registration

### Creating Your Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a conversation** with BotFather by clicking "Start"
3. **Send** `/newbot` command
4. **Provide a name** for your bot (e.g., "Personal Finance Tracker Bot")
5. **Provide a username** for your bot (must end in 'bot', e.g., `finance_tracker_xyz_bot`)
6. **Save the bot token** provided by BotFather (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Setting Up Your Bot Token

After receiving your bot token from BotFather:

1. Copy `.env.example` to `.env` in the `bot/` directory
2. Replace `your_bot_token_here` with your actual bot token
3. **Never commit** the `.env` file to version control (it's gitignored)

**⚠️ Security Warning:** Keep your bot token secret! Anyone with access to your token can control your bot.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token from @BotFather (required)
- `CONVEX_URL` - Your Convex deployment URL (required for backend integration)
- `RORK_API_KEY` - Your Rork Toolkit API key (required for AI features)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `LOG_LEVEL` - Logging level (info, debug, error)

## Convex Backend Integration

The bot server integrates with Convex serverless backend for data storage and business logic.

### Setting Up Convex

1. **Get your Convex deployment URL:**
   - Navigate to [Convex Dashboard](https://dashboard.convex.dev)
   - Select your project
   - Go to **Settings** → **Deployment URL**
   - Copy the URL (format: `https://your-deployment.convex.cloud`)

2. **Configure the bot:**
   - Add `CONVEX_URL` to your `.env` file
   - The URL must start with `https://`
   - Example: `CONVEX_URL=https://happy-animal-123.convex.cloud`

3. **Deploy Convex functions:**
   ```bash
   cd ../convex
   npx convex dev  # For development
   npx convex deploy  # For production
   ```

### Health Check on Startup

The bot performs a health check on startup to verify Convex connectivity:

- **3 retry attempts** with exponential backoff (1s, 2s, 4s)
- **Measures latency** for each attempt
- **Exits with error** if all attempts fail
- **Logs troubleshooting tips** on failure

### Connection Monitoring

The bot monitors Convex connection health:

- Startup health check before accepting commands
- `/status` command for real-time health monitoring
- Automatic error classification (network, timeout, auth, etc.)
- Bilingual error messages (English/Arabic)

## Available Commands

Once the bot is running, users can interact with it using:

- `/start` - Start the bot and receive a welcome message
- `/help` - Display available commands and help information
- `/status` - Check system status and backend health

### `/status` Command Output

The `/status` command provides comprehensive system information:

```
🤖 System Status

Backend Status: ✅ healthy
Backend Version: 1.0.0
Backend Latency: 45ms
Backend Message: Convex backend is operational

Bot Uptime: 2h 15m 30s
Memory Usage: 45MB / 128MB
Timestamp: 2025-10-01T12:00:00.000Z

All systems operational ✨
```

**Metrics Included:**
- Backend health status with visual indicators
- Backend version and response latency
- Bot uptime (days, hours, minutes, seconds)
- Memory usage (heap used / heap total)
- ISO 8601 timestamp

## Testing

Tests use Jest with ts-jest. Target coverage: 60%+ for handlers, 90%+ for utilities.

## Troubleshooting

### Bot Not Responding

- Verify your `TELEGRAM_BOT_TOKEN` is correct in `.env`
- Check that the bot server is running without errors
- Ensure your bot is not already running in another instance (only one polling connection allowed)

### Convex Connection Issues

#### ❌ "Failed to connect to Convex backend"

**Possible Causes:**
- Invalid or missing `CONVEX_URL` in `.env`
- Convex deployment not running
- Network connectivity issues
- Firewall blocking HTTPS connections

**Solutions:**
1. **Verify CONVEX_URL:**
   ```bash
   # Check your .env file
   cat .env | grep CONVEX_URL
   
   # URL must start with https://
   # Example: CONVEX_URL=https://happy-animal-123.convex.cloud
   ```

2. **Test Convex deployment:**
   - Open your `CONVEX_URL` in a browser
   - Should see a Convex deployment page
   - If not accessible, check Convex Dashboard

3. **Deploy Convex functions:**
   ```bash
   cd ../convex
   npx convex dev
   ```

4. **Check network connectivity:**
   ```bash
   # Test HTTPS connectivity
   curl -I https://your-deployment.convex.cloud
   ```

#### ⏱️ "Request Timeout"

**Possible Causes:**
- Slow network connection
- Convex backend under heavy load
- Large query response

**Solutions:**
- Wait a moment and try again
- Check your internet speed
- Verify Convex Dashboard shows no issues
- Use `/status` command to check latency

#### 🔗 "Configuration Error"

**Possible Causes:**
- `CONVEX_URL` not in HTTPS format
- Malformed URL in `.env`

**Solutions:**
1. **Validate URL format:**
   - Must start with `https://`
   - No trailing slashes
   - Example: `https://happy-animal-123.convex.cloud`

2. **Regenerate from Convex Dashboard:**
   - Go to Settings → Deployment URL
   - Copy the exact URL provided

#### 🔐 "Authentication Error"

**Possible Causes:**
- Invalid Convex deployment URL
- Deployment deleted or moved

**Solutions:**
- Verify deployment exists in Convex Dashboard
- Check if deployment URL changed
- Redeploy Convex functions if needed

### Common Error Messages

**English:**
```
❌ Connection Error
Unable to connect to the backend server.
💡 Suggestions:
• Check your internet connection
• Try again in a few moments
• Contact support if the problem persists
```

**Arabic:**
```
❌ خطأ في الاتصال
تعذر الاتصال بخادم النظام.
💡 اقتراحات:
• تحقق من اتصال الإنترنت
• حاول مرة أخرى بعد لحظات
• اتصل بالدعم الفني إذا استمرت المشكلة
```

### Checking Logs

View detailed logs for debugging:

```bash
# View all logs
npm run dev

# Filter for Convex-related logs
npm run dev | grep -i convex

# Check error logs only
npm run dev | grep -i error
```

**Key Log Messages:**
- `✅ Convex backend connection established` - Health check passed
- `❌ All Convex health check attempts failed` - Connection failed
- `Convex health check successful` - Individual check passed
- `Health check failed, retrying` - Retry in progress

### Connection Errors

- Check your internet connection
- Verify Telegram API is accessible (not blocked by firewall)
- Review server logs for detailed error messages
- Ensure `CONVEX_URL` is properly configured

### Getting Help

If issues persist:

1. **Check server logs** for detailed error messages
2. **Verify environment variables** are correctly set
3. **Test Convex Dashboard** to ensure deployment is running
4. **Review Convex function logs** in the dashboard
5. **Contact support** with log excerpts and error messages
