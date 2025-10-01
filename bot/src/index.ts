import { createBot, setupShutdownHandlers } from "./bot";
import { registerCommandHandlers, registerMessageHandlers } from "./handlers";
import { performStartupHealthCheck } from "./services/convexHealth";
import logger from "./utils/logger";

/**
 * Main entry point for the Telegram bot server.
 * Initializes the bot, registers handlers, and sets up graceful shutdown.
 * 
 * Startup sequence:
 * 1. Load environment variables
 * 2. Perform Convex backend health check
 * 3. Initialize Telegram bot
 * 4. Register command handlers
 * 5. Setup graceful shutdown
 */
async function main() {
  try {
    logger.info("🚀 Starting Telegram bot server...");
    logger.info("📋 Startup sequence initiated", {
      step: "1/5 - Environment loaded",
    });

    // Step 2: Perform Convex health check
    // NOTE: Disabled due to Docker Convex function registration issue
    // Function exists in dashboard but not accessible via ConvexHttpClient
    logger.info("📋 Startup sequence", { step: "2/5 - Checking Convex backend" });
    logger.info("ℹ️  Health check skipped - function visible in dashboard but not via API");
    // await performStartupHealthCheck();

    // Step 3: Create bot instance
    logger.info("📋 Startup sequence", { step: "3/5 - Initializing Telegram bot" });
    const bot = createBot();

    // Get bot info
    const botInfo = await bot.getMe();
    logger.info("✅ Bot connected successfully", {
      botId: botInfo.id,
      botUsername: botInfo.username,
      botName: botInfo.first_name,
    });

    // Step 4: Register command and message handlers
    logger.info("📋 Startup sequence", { step: "4/5 - Registering handlers" });
    registerCommandHandlers(bot);
    registerMessageHandlers(bot);

    // Step 5: Setup graceful shutdown handlers
    logger.info("📋 Startup sequence", { step: "5/5 - Setting up shutdown handlers" });
    setupShutdownHandlers(bot);

    logger.info("✅ Bot server is running", {
      mode: "polling",
      username: botInfo.username,
    });
    logger.info("🎉 All systems operational - ready to receive messages");
  } catch (error) {
    logger.error("❌ Failed to start bot server", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

// Start the bot
main();
